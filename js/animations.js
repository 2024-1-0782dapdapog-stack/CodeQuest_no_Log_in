/**
 * CODEQUEST – ANIMATIONS & EFFECTS
 * Confetti, transitions, and interactive effects
 */
(function() {

  /* ── Confetti Animation ── */
  window.playConfetti = function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#fbbf24', '#fb923c', '#38bdf8', '#34d399', '#f87171'];

    // Create confetti particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4 + 4,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1
      });
    }

    let frame = 0;
    const maxFrames = 120;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        // Physics
        p.vy += 0.15; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Air resistance
        p.vx *= 0.99;

        // Draw confetti
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    animate();
  };

  /* ── Page Transition Effect ── */
  window.fadeOutPage = function() {
    const app = document.getElementById('app');
    if (app) {
      app.style.opacity = '0';
      app.style.transition = 'opacity 0.3s ease';
    }
  };

  window.fadeInPage = function() {
    const app = document.getElementById('app');
    if (app) {
      app.style.opacity = '1';
      app.style.transition = 'opacity 0.3s ease';
    }
  };

  /* ── Add smooth transitions to all elements ── */
  window.initSmoothTransitions = function() {
    // Add fade-in animation to level content
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes scaleUp {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      #instructions {
        animation: slideInLeft 0.4s ease-out;
      }

      #editor-wrap {
        animation: slideInRight 0.4s ease-out;
      }

      .modal-box {
        animation: scaleUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      }

      /* Button hover effects */
      .btn-run,
      .btn-nav,
      .btn-reset-code,
      .btn-hint,
      .btn-start,
      .icon-btn {
        transition: all 0.2s ease;
        position: relative;
      }

      .btn-run:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(52, 211, 153, 0.3);
      }

      .btn-run:active {
        transform: translateY(0);
      }

      .btn-nav:hover {
        transform: translateX(var(--translate-x, 0));
        opacity: 0.9;
      }

      .btn-nav:active {
        transform: scale(0.98);
      }

      .btn-reset-code:hover {
        transform: rotate(180deg) scale(1.1);
      }

      .btn-hint:hover {
        transform: scale(1.05);
        background: rgba(251, 191, 36, 0.2);
      }

      .btn-start:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 24px rgba(56, 189, 248, 0.4);
      }

      .icon-btn:hover {
        transform: scale(1.15);
        opacity: 0.8;
      }

      .icon-btn:active {
        transform: scale(0.95);
      }

      /* Smooth transitions for all interactive elements */
      button, input, textarea, select {
        transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      }

      /* Mobile-friendly touch feedback */
      @media (hover: none) {
        .btn-run:active {
          transform: scale(0.97);
        }

        .icon-btn:active {
          opacity: 0.6;
        }
      }
    `;
    document.head.appendChild(style);
  };

})();
