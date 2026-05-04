/**
 * CODEQUEST - HERO (futuristic alley)
 * Restores pixel bugs + splat interactions and keeps the path visible while moving forward.
 */
(function () {
  'use strict';

  const hero = document.createElement('section');
  hero.id = 'cq-hero';
  hero.setAttribute('aria-label', 'CodeQuest hero');
  hero.innerHTML = `
    <canvas id="hero-canvas" aria-hidden="true"></canvas>
    <div id="hero-terminal" aria-hidden="true">
      <span id="hero-glitch-text">initializing...</span><span id="hero-blink">█</span>
    </div>
    <div id="hero-content">
      <div id="hero-kicker">24 LEVELS · PROGRESS SAVES AUTOMATICALLY</div>
      <h1 id="hero-title">Code<span class="accent">Quest</span></h1>
      <p id="hero-sub">Build real websites from scratch. Sign in locally and keep your progress on this browser.</p>
      <div id="hero-tracks">
        <div class="hero-track"><span class="hero-track-icon">🏗️</span>HTML · Levels 1-7</div>
        <div class="hero-track"><span class="hero-track-icon">🎨</span>CSS · Levels 8-14</div>
        <div class="hero-track"><span class="hero-track-icon">⚡</span>JavaScript · Levels 15-24</div>
      </div>
      <div id="hero-quests" aria-label="Choose your quest">
        <button type="button" class="hero-quest active" data-quest-id="portfolio">Build a Portfolio</button>
        <button type="button" class="hero-quest" data-quest-id="cafe">Launch a Cafe Site</button>
        <button type="button" class="hero-quest" data-quest-id="mini">Code a Mini Game</button>
      </div>
      <button id="hero-cta" type="button">Start Learning <span class="hero-cta-arrow">→</span></button>
    </div>
  `;

  document.body.insertBefore(hero, document.body.firstChild);
  const splash = document.getElementById('splash');
  if (splash) splash.classList.add('hidden');

  const style = document.createElement('style');
  style.textContent = `
    #hero-canvas { cursor: crosshair; }
    #hero-terminal {
      position: absolute;
      left: 28px;
      bottom: 24px;
      z-index: 6;
      font-family: 'Space Mono', 'Courier New', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      color: rgba(96, 222, 255, 0.62);
      pointer-events: none;
      user-select: none;
      text-shadow: 0 0 16px rgba(73, 231, 255, 0.35);
    }
    #hero-blink { animation: heroBlink 1s step-end infinite; }
    @keyframes heroBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

    .cq-kill-text {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      font-family: 'Space Mono', monospace;
      font-size: 0.86rem;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #34d399;
      text-shadow: 0 0 8px #34d399, 0 0 24px #34d399;
      animation: cqKillText 0.9s ease-out forwards;
      white-space: nowrap;
    }
    @keyframes cqKillText {
      0% { opacity: 1; transform: translateY(0) scale(1.08); }
      70% { opacity: 1; transform: translateY(-42px) scale(1); }
      100% { opacity: 0; transform: translateY(-64px) scale(0.88); }
    }

    #cq-flash {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9997;
      background: transparent;
      transition: background 0.06s;
    }
    #cq-flash.on { background: rgba(73, 231, 255, 0.09); }
  `;
  document.head.appendChild(style);

  const flashEl = document.createElement('div');
  flashEl.id = 'cq-flash';
  document.body.appendChild(flashEl);

  const glitchEl = document.getElementById('hero-glitch-text');
  const heroContent = document.getElementById('hero-content');
  const progressMessages = [
    'entry point locked',
    'approaching corridor',
    'scanning surface tiles',
    'tracking light signatures',
    'deep fog traversal',
    'near launch threshold'
  ];

  function prefersLiteHero() {
    return window.matchMedia('(max-width: 820px), (hover: none) and (pointer: coarse), (prefers-reduced-motion: reduce)').matches;
  }

  function updateTerminalByProgress(progress) {
    if (!glitchEl) return;
    const index = Math.min(
      progressMessages.length - 1,
      Math.floor(progress * progressMessages.length)
    );
    glitchEl.textContent = progressMessages[index];
  }

  let THREE;
  let renderer;
  let scene;
  let camera;
  let running = false;
  let animId = null;
  let time = 0;

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollZ = 0;
  let targetScrollZ = 0;
  let slideStep = 0;
  let slideLocked = false;
  let slideUnlockTimer = null;

  const MAX_SCROLL_Z = 8;
  const SLIDE_STEPS = 11;
  const SLIDE_LOCK_MS = 180;

  let streakInterval = null;
  const delayedTimers = [];

  function loadThree(callback) {
    if (prefersLiteHero()) {
      hero.classList.add('hero-lite');
      return;
    }
    if (window.THREE) {
      callback();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = callback;
    script.onerror = () => console.warn('[CQ] Three.js unavailable');
    document.head.appendChild(script);
  }

  function RNG(seed) {
    let s = ((seed || 1) % 2147483647 + 2147483647) % 2147483647 || 1;
    this.next = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function makeTileTexture(seed) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const rng = new RNG(seed);

    const base = 22 + rng.next() * 10;
    ctx.fillStyle = `rgb(${base}, ${base + 3}, ${base + 8})`;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 2800; i += 1) {
      const x = rng.next() * size;
      const y = rng.next() * size;
      const v = base + 5 + rng.next() * 20;
      ctx.fillStyle = `rgba(${v}, ${v}, ${v + 4}, ${0.1 + rng.next() * 0.15})`;
      ctx.fillRect(x, y, rng.next() * 2.5 + 0.4, rng.next() * 2.5 + 0.4);
    }

    ctx.strokeStyle = 'rgba(4, 6, 12, 0.92)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const a = (Math.PI / 3) * i;
      const hx = size / 2 + size * 0.45 * Math.cos(a);
      const hy = size / 2 + size * 0.45 * Math.sin(a);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(50, 60, 80, 0.2)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const a = (Math.PI / 3) * i;
      const hx = size / 2 + size * 0.40 * Math.cos(a);
      const hy = size / 2 + size * 0.40 * Math.sin(a);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();

    if (rng.next() > 0.5) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 0.8;
      let px = size * (0.25 + rng.next() * 0.5);
      let py = size * (0.25 + rng.next() * 0.5);
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (let i = 0; i < 4; i += 1) {
        px += (rng.next() - 0.5) * 26;
        py += (rng.next() - 0.5) * 26;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.52);
    grad.addColorStop(0, 'rgba(255,255,255,0.03)');
    grad.addColorStop(1, 'rgba(0,0,0,0.14)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
  }

  const BUG_DEFS = [
    { name: 'NULL_PTR', body: '#b03030', eye: '#ffe066', leg: '#7a1f1f', glow: '#e74c3c' },
    { name: 'STACK_OVF', body: '#5a2d82', eye: '#00e5ff', leg: '#3d1f5a', glow: '#9b59b6' },
    { name: 'DEADLOCK', body: '#1a4a72', eye: '#00ffcc', leg: '#0e2e4a', glow: '#2980b9' },
    { name: 'MEM_LEAK', body: '#1a6640', eye: '#ffd32a', leg: '#0e3d26', glow: '#27ae60' }
  ];

  function makeBugTexture(type, frame) {
    const size = 128;
    const pixel = 4;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const drawPixel = (gx, gy, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(gx * pixel, gy * pixel, w * pixel, h * pixel);
    };

    const halo = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size * 0.46);
    halo.addColorStop(0, `${type.glow}44`);
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, size, size);

    const legOffset = frame === 0 ? 0 : 1;
    drawPixel(5, 8, 22, 12, type.body);
    drawPixel(8, 3, 16, 6, type.body);
    drawPixel(10, 7, 12, 2, type.body);

    drawPixel(9, 4, 4, 3, type.eye);
    drawPixel(19, 4, 4, 3, type.eye);

    ctx.fillStyle = '#000';
    ctx.fillRect(10.5 * pixel, 5 * pixel, pixel, pixel);
    ctx.fillRect(20.5 * pixel, 5 * pixel, pixel, pixel);

    [10.5, 20.5].forEach(ex => {
      const eyeGlow = ctx.createRadialGradient(ex * pixel, 5 * pixel, 0, ex * pixel, 5 * pixel, pixel * 2.4);
      eyeGlow.addColorStop(0, `${type.eye}bb`);
      eyeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = eyeGlow;
      ctx.fillRect((ex - 2) * pixel, 3 * pixel, pixel * 5, pixel * 5);
    });

    drawPixel(11, 1, 2, 3, type.leg);
    drawPixel(19, 1, 2, 3, type.leg);

    [12, 20].forEach(ax => {
      const tipGlow = ctx.createRadialGradient(ax * pixel, 1.5 * pixel, 0, ax * pixel, 1.5 * pixel, pixel * 1.6);
      tipGlow.addColorStop(0, type.glow);
      tipGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = tipGlow;
      ctx.fillRect((ax - 1.5) * pixel, 0, pixel * 4, pixel * 3);
    });

    ctx.strokeStyle = `${type.leg}99`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8 * pixel, 14 * pixel);
    ctx.lineTo(12 * pixel, 14 * pixel);
    ctx.lineTo(12 * pixel, 12 * pixel);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(24 * pixel, 14 * pixel);
    ctx.lineTo(20 * pixel, 14 * pixel);
    ctx.lineTo(20 * pixel, 12 * pixel);
    ctx.stroke();

    const legColor = type.leg;
    drawPixel(1, 9 + legOffset, 4, 1, legColor);
    drawPixel(1, 13 - legOffset, 4, 1, legColor);
    drawPixel(1, 17 + legOffset, 4, 1, legColor);

    drawPixel(27, 9 + legOffset, 4, 1, legColor);
    drawPixel(27, 13 - legOffset, 4, 1, legColor);
    drawPixel(27, 17 + legOffset, 4, 1, legColor);

    drawPixel(0, 10 + legOffset, 1, 1, legColor);
    drawPixel(0, 14 - legOffset, 1, 1, legColor);
    drawPixel(0, 18 + legOffset, 1, 1, legColor);

    drawPixel(31, 10 + legOffset, 1, 1, legColor);
    drawPixel(31, 14 - legOffset, 1, 1, legColor);
    drawPixel(31, 18 + legOffset, 1, 1, legColor);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(5 * pixel, 16 * pixel, 22 * pixel, 5 * pixel);
    ctx.fillStyle = type.eye;
    ctx.font = `bold ${pixel * 2.1}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(type.name, size / 2, 18.5 * pixel);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5 * pixel, 8 * pixel, 22 * pixel, 12 * pixel);
    ctx.strokeRect(8 * pixel, 3 * pixel, 16 * pixel, 6 * pixel);

    return new THREE.CanvasTexture(canvas);
  }

  const bugTextureCache = {};
  function getBugTexture(typeIndex, frame) {
    const key = `${typeIndex}_${frame}`;
    if (!bugTextureCache[key]) bugTextureCache[key] = makeBugTexture(BUG_DEFS[typeIndex], frame);
    return bugTextureCache[key];
  }

  function initScene() {
    if (running) return;
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    running = true;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x080c18, 1);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c18);
    scene.fog = new THREE.FogExp2(0x080c18, 0.058);

    camera = new THREE.PerspectiveCamera(56, 1, 0.1, 90);
    camera.position.set(0, 2.55, 6.4);
    camera.lookAt(0, 0.6, -28);

    resize();
    window.addEventListener('resize', resize, { passive: true });

    scene.add(new THREE.AmbientLight(0x0c1830, 3.35));

    const vanishingLight = new THREE.PointLight(0x00bfff, 5.0, 65, 1.35);
    vanishingLight.position.set(0, 5, -40);
    scene.add(vanishingLight);

    const topStrip = new THREE.DirectionalLight(0x00e5ff, 0.35);
    topStrip.position.set(0, 10, 0);
    scene.add(topStrip);

    const frontFill = new THREE.DirectionalLight(0x0d1a35, 0.75);
    frontFill.position.set(0, 4, 8);
    scene.add(frontFill);

    function hexShape(r) {
      const shape = new THREE.Shape();
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI / 3) * i;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      return shape;
    }

    const HR = 1.9;
    const HW = HR * Math.sqrt(3);
    const HH = HR * 2;
    const COLS = 13;
    const ROWS = 38;
    const RSTEP = HH * 0.75;
    const LOOP = RSTEP;

    const hexGeo = new THREE.ExtrudeGeometry(hexShape(HR * 0.96), {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.03,
      bevelSegments: 2
    });
    hexGeo.rotateX(-Math.PI / 2);

    const tileTextures = Array.from({ length: 10 }, (_, i) => makeTileTexture(i * 41 + 13));
    const tiles = [];
    const tileGroup = new THREE.Group();
    scene.add(tileGroup);

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const odd = col % 2 === 1;
        const x = (col - Math.floor(COLS / 2)) * HW;
        const z = -(row * RSTEP) - (odd ? HR * 0.75 : 0);

        const mat = new THREE.MeshLambertMaterial({
          map: tileTextures[(row * COLS + col) % tileTextures.length],
          color: 0x5a6878,
          transparent: true,
          opacity: 0
        });

        const mesh = new THREE.Mesh(hexGeo.clone(), mat);
        mesh.position.set(x, 0, z);
        tileGroup.add(mesh);
        tiles.push({ mesh, baseZ: z });
      }
    }

    const centerLinePoints = [];
    for (let i = 0; i < 80; i += 1) {
      centerLinePoints.push(new THREE.Vector3(0, 0.05, -i * 1.6));
    }
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(centerLinePoints),
      new THREE.LineBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    ));

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 14, 10),
      new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    orb.position.set(0, 1.0, -42);
    scene.add(orb);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(5, 10, 8),
      new THREE.MeshBasicMaterial({
        color: 0x0033aa,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide
      })
    );
    halo.position.copy(orb.position);
    scene.add(halo);

    const wallGroup = new THREE.Group();
    scene.add(wallGroup);
    const wallX = (Math.floor(COLS / 2) + 0.9) * HW;

    for (let i = 0; i < 22; i += 1) {
      const z = -i * 3.8;
      [-wallX, wallX].forEach(x => {
        const wallMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 8, 3.2),
          new THREE.MeshLambertMaterial({ color: 0x0c1628, transparent: true, opacity: 0.65 })
        );
        wallMesh.position.set(x, 3.5, z);
        wallGroup.add(wallMesh);

        if (i % 3 === 0) {
          const glowMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.05, 4),
            new THREE.MeshBasicMaterial({
              color: 0x00e5ff,
              transparent: true,
              opacity: 0.07,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            })
          );
          glowMesh.position.set(x > 0 ? x - 0.2 : x + 0.2, 3.5, z);
          glowMesh.rotation.y = Math.PI / 2;
          scene.add(glowMesh);
        }
      });
    }

    const particleCount = 240;
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);
    const rng = new RNG(1234);

    for (let i = 0; i < particleCount; i += 1) {
      particlePos[i * 3] = (rng.next() - 0.5) * 10;
      particlePos[i * 3 + 1] = rng.next() * 6 + 0.2;
      particlePos[i * 3 + 2] = -(rng.next() * 42 + 2);

      particleVel[i * 3] = (rng.next() - 0.5) * 0.003;
      particleVel[i * 3 + 1] = 0.004 + rng.next() * 0.005;
      particleVel[i * 3 + 2] = 0.011 + rng.next() * 0.009;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleSystem = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0x3366aa,
        size: 0.05,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      })
    );
    scene.add(particleSystem);

    const streaks = [];
    function spawnStreak() {
      const localRng = new RNG(Date.now() % 99999);
      const x = (localRng.next() - 0.5) * 5;
      const y = 1.4 + localRng.next() * 2.8;

      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, -40),
        new THREE.Vector3(x, y, -6)
      ]);
      const mat = new THREE.LineBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      streaks.push({ line, life: 0, speed: 0.035 + localRng.next() * 0.055 });
    }

    for (let i = 0; i < 3; i += 1) {
      delayedTimers.push(window.setTimeout(spawnStreak, i * 1100));
    }
    streakInterval = window.setInterval(spawnStreak, 2000);

    const bugs = [];
    function spawnBug() {
      const typeIndex = Math.floor(Math.random() * 4);
      const mat = new THREE.SpriteMaterial({ map: getBugTexture(typeIndex, 0), transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(2.1, 2.1, 1);

      const z = -(22 + Math.random() * 16);
      const x = (Math.random() - 0.5) * 4.5;
      sprite.position.set(x, 1.05, z);

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.6, 10),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(x, 0.02, z);
      scene.add(shadow);

      sprite.userData = {
        typeIndex,
        t0: getBugTexture(typeIndex, 0),
        t1: getBugTexture(typeIndex, 1),
        alive: true,
        shadow,
        speed: 0.02 + Math.random() * 0.018,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.04 + Math.random() * 0.025,
        frame: 0,
        tick: 0,
        frameEvery: 7 + Math.floor(Math.random() * 5)
      };

      scene.add(sprite);
      bugs.push(sprite);
    }

    for (let i = 0; i < 5; i += 1) {
      delayedTimers.push(window.setTimeout(spawnBug, i * 650 + 500));
    }

    const raycaster = new THREE.Raycaster();
    const pointer2 = new THREE.Vector2();

    hero.addEventListener('click', event => {
      const rect = canvas.getBoundingClientRect();
      pointer2.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer2.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer2, camera);

      for (let i = bugs.length - 1; i >= 0; i -= 1) {
        const bug = bugs[i];
        if (!bug.userData.alive) continue;
        if (raycaster.ray.distanceToPoint(bug.position) < 1.55) {
          killBug(bug, event.clientX, event.clientY);
          return;
        }
      }
    });

    function killBug(bug, screenX, screenY) {
      bug.userData.alive = false;
      if (bug.userData.shadow) scene.remove(bug.userData.shadow);
      scene.remove(bug);
      bugs.splice(bugs.indexOf(bug), 1);

      spawnParticles(bug.position.clone(), BUG_DEFS[bug.userData.typeIndex].glow);

      flashEl.classList.add('on');
      window.setTimeout(() => flashEl.classList.remove('on'), 75);

      const labels = ['NULL FIXED', 'PATCHED', 'BUG KILLED', 'DELETED', 'SQUASHED', 'DEBUGGED'];
      const label = document.createElement('div');
      label.className = 'cq-kill-text';
      label.textContent = labels[Math.floor(Math.random() * labels.length)];
      label.style.left = `${screenX - 44}px`;
      label.style.top = `${screenY - 28}px`;
      document.body.appendChild(label);
      window.setTimeout(() => label.remove(), 950);

      delayedTimers.push(window.setTimeout(spawnBug, 1200 + Math.random() * 1800));
    }

    function spawnParticles(position, hexColor) {
      const color = parseInt(hexColor.replace('#', ''), 16);
      for (let i = 0; i < 16; i += 1) {
        const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 1,
          blending: THREE.AdditiveBlending
        });
        const cube = new THREE.Mesh(geo, mat);
        cube.position.copy(position);

        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          0.06 + Math.random() * 0.14,
          (Math.random() - 0.5) * 0.2
        );

        scene.add(cube);
        let frame = 0;
        const iv = window.setInterval(() => {
          velocity.y -= 0.005;
          velocity.multiplyScalar(0.93);
          cube.position.add(velocity);
          cube.rotation.x += 0.12;
          cube.rotation.z += 0.09;
          cube.material.opacity = Math.max(0, 1 - frame / 24);

          frame += 1;
          if (frame >= 24) {
            window.clearInterval(iv);
            scene.remove(cube);
            geo.dispose();
            mat.dispose();
          }
        }, 16);
      }
    }

    const forwardSpeed = 0.052;

    function tick() {
      animId = window.requestAnimationFrame(tick);
      time += 0.013;

      mouse.x += (mouse.tx - mouse.x) * 0.055;
      mouse.y += (mouse.ty - mouse.y) * 0.055;
      scrollZ += (targetScrollZ - scrollZ) * 0.04;

      camera.position.x = mouse.x * 0.85;
      camera.position.y = 2.55 - mouse.y * 0.42 - scrollZ * 0.1;
      camera.position.z = 6.4 - scrollZ * 0.5;
      camera.lookAt(mouse.x * 0.1, 0.65 + mouse.y * 0.16, -30);

      tileGroup.position.z += forwardSpeed;
      if (tileGroup.position.z >= LOOP) tileGroup.position.z -= LOOP;

      wallGroup.position.z += forwardSpeed * 0.5;
      if (wallGroup.position.z >= 3.8) wallGroup.position.z -= 3.8;

      tiles.forEach(tile => {
        const worldZ = tile.baseZ + tileGroup.position.z;
        const dist = -worldZ;
        const p = Math.max(0, Math.min(1, (dist - 1.2) / 18));
        tile.mesh.material.opacity = Math.min(0.95, p * 1.12);
      });

      orb.material.opacity = 0.4 + 0.18 * Math.sin(time * 1.5);
      orb.scale.setScalar(1 + 0.1 * Math.sin(time * 2.2));
      vanishingLight.intensity = 5.0 + 0.6 * Math.sin(time * 7.1) + 0.4 * Math.sin(time * 2.9);

      for (let i = 0; i < particleCount; i += 1) {
        particlePos[i * 3] += particleVel[i * 3];
        particlePos[i * 3 + 1] += particleVel[i * 3 + 1];
        particlePos[i * 3 + 2] += particleVel[i * 3 + 2];
        if (particlePos[i * 3 + 2] > 5 || particlePos[i * 3 + 1] > 8) {
          particlePos[i * 3] = (Math.random() - 0.5) * 9;
          particlePos[i * 3 + 1] = Math.random() * 0.5;
          particlePos[i * 3 + 2] = -(Math.random() * 40 + 4);
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      for (let i = streaks.length - 1; i >= 0; i -= 1) {
        const st = streaks[i];
        st.life += st.speed;
        st.line.material.opacity = Math.max(0, 0.32 * Math.sin(st.life * Math.PI));
        if (st.life >= 1) {
          scene.remove(st.line);
          streaks.splice(i, 1);
        }
      }

      for (let i = bugs.length - 1; i >= 0; i -= 1) {
        const bug = bugs[i];
        if (!bug.userData.alive) continue;

        bug.userData.tick += 1;
        if (bug.userData.tick >= bug.userData.frameEvery) {
          bug.userData.tick = 0;
          bug.userData.frame = 1 - bug.userData.frame;
          bug.material.map = bug.userData.frame === 0 ? bug.userData.t0 : bug.userData.t1;
          bug.material.needsUpdate = true;
        }

        bug.userData.wobble += bug.userData.wobbleSpeed;
        bug.position.z += bug.userData.speed;
        bug.position.x += Math.sin(bug.userData.wobble * 0.6) * 0.006;
        bug.position.y = 1.05 + Math.abs(Math.sin(bug.userData.wobble * 2)) * 0.07;

        if (bug.userData.shadow) {
          bug.userData.shadow.position.x = bug.position.x;
          bug.userData.shadow.position.z = bug.position.z;
        }

        if (bug.position.z > 4) {
          if (bug.userData.shadow) scene.remove(bug.userData.shadow);
          scene.remove(bug);
          bugs.splice(i, 1);
          delayedTimers.push(window.setTimeout(spawnBug, 400));
        }
      }

      renderer.render(scene, camera);
    }

    tick();

    window.__heroThreeStop = () => {
      if (!running) return;
      running = false;
      if (animId) window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      if (streakInterval) {
        window.clearInterval(streakInterval);
        streakInterval = null;
      }
      delayedTimers.forEach(id => window.clearTimeout(id));
      delayedTimers.length = 0;
      renderer.dispose();
    };

    window.__heroThreeStart = () => {
      if (!running) {
        loadThree(() => {
          THREE = window.THREE;
          initScene();
        });
      }
    };
  }

  function resize() {
    const parent = document.getElementById('hero-canvas').parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (renderer) renderer.setSize(width, height);
    if (camera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  hero.addEventListener('mousemove', event => {
    if (prefersLiteHero()) return;
    mouse.tx = ((event.clientX / window.innerWidth) - 0.5) * 1.5;
    mouse.ty = ((event.clientY / window.innerHeight) - 0.5) * 0.45;
  }, { passive: true });

  function applySlideStep(step) {
    const maxStep = SLIDE_STEPS - 1;
    const nextStep = Math.max(0, Math.min(maxStep, step));
    if (nextStep === slideStep) return;
    slideStep = nextStep;
    const progress = maxStep === 0 ? 0 : slideStep / maxStep;
    targetScrollZ = progress * MAX_SCROLL_Z;
    updateTerminalByProgress(progress);

    if (heroContent) {
      const lift = Math.min(120, progress * 160);
      const opacity = Math.max(0, 1 - progress * 1.35);
      heroContent.style.transform = `translateY(-${lift}px)`;
      heroContent.style.opacity = String(opacity);
      heroContent.style.pointerEvents = opacity < 0.08 ? 'none' : 'auto';
    }

    slideLocked = true;
    if (slideUnlockTimer) window.clearTimeout(slideUnlockTimer);
    slideUnlockTimer = window.setTimeout(() => {
      slideLocked = false;
    }, SLIDE_LOCK_MS);
  }

  hero.addEventListener('wheel', event => {
    event.preventDefault();
    // Scroll is intentionally disabled on the hero.
    // Keep the card fixed while users enjoy the live background scene.
  }, { passive: false });

  function loadGSAP(callback) {
    if (window.gsap) {
      callback();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function finalizeExit() {
    hero.style.display = 'none';
    hero.setAttribute('aria-hidden', 'true');

    if (window.openTtsVoicePicker) {
      window.openTtsVoicePicker();
      return;
    }
    if (window.startCodeQuestGame) window.startCodeQuestGame();
  }

  function exitHero() {
    if (hero.dataset.exiting) return;
    hero.dataset.exiting = '1';
    if (window.__heroThreeStop) window.__heroThreeStop();

    loadGSAP(() => {
      if (window.gsap) {
        const tl = window.gsap.timeline({ onComplete: finalizeExit });
        tl.to('#hero-content', { opacity: 0, y: -22, duration: 0.3, ease: 'power2.in' }, 0);
        tl.to('#hero-terminal', { opacity: 0, duration: 0.2 }, 0);
        tl.to('#cq-hero', { opacity: 0, duration: 0.48, ease: 'power2.inOut' }, 0.1);
      } else {
        hero.classList.add('hero-exiting');
        window.setTimeout(finalizeExit, 500);
      }
    });
  }

  window.showHeroHome = function () {
    hero.classList.remove('hero-exiting');
    hero.style.cssText = '';
    hero.dataset.exiting = '';
    hero.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('cq-game-mode');

    const content = document.querySelector('#hero-content');
    const terminal = document.querySelector('#hero-terminal');
    if (content) content.style.cssText = '';
    if (terminal) terminal.style.cssText = '';

    if (window.gsap) {
      window.gsap.set(['#cq-hero', '#hero-content', '#hero-terminal'], { clearProps: 'all' });
    }

    targetScrollZ = 0;
    scrollZ = 0;
    slideStep = 0;
    slideLocked = false;
    if (slideUnlockTimer) {
      window.clearTimeout(slideUnlockTimer);
      slideUnlockTimer = null;
    }
    applySlideStep(0);

    if (window.__heroThreeStart) window.__heroThreeStart();
    if (splash) splash.classList.add('hidden');
  };

  const cta = document.getElementById('hero-cta');
  const questButtons = Array.from(document.querySelectorAll('.hero-quest'));
  function selectHeroQuest(id, shouldReset) {
    questButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.questId === id);
    });
    if (window.CQ_QUESTS && window.CQ_QUESTS.selectQuest) {
      window.CQ_QUESTS.selectQuest(id, { reset: !!shouldReset });
    }
  }
  questButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      selectHeroQuest(button.dataset.questId || 'portfolio', true);
    });
  });
  if (window.CQ_QUESTS && window.CQ_QUESTS.getCurrent) {
    selectHeroQuest(window.CQ_QUESTS.getCurrent().id, false);
  }
  if (cta) cta.addEventListener('click', exitHero);

  loadThree(() => {
    THREE = window.THREE;
    initScene();
  });

  applySlideStep(0);
})();
