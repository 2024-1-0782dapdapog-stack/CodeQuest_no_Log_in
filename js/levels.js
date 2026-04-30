/**
 * CODEQUEST – LEVELS  (beginner-friendly rewrite)
 * 
 * Design rules:
 *  - Each task is ONE simple thing a beginner can do
 *  - The starter code already contains ALL previous completed work
 *  - The hint IS the exact correct answer — copy-paste it and it works
 *  - The preview always looks beautiful because STATE.html/css/js is pre-loaded
 *  - Each level you can CLEARLY see something new appearing on the page
 */

const LEVELS = [

  /* ════════════════════════════════════════════
     HTML  ·  Levels 1 – 7
     ════════════════════════════════════════════ */

  {
    id: 1,
    chapter: 'HTML',
    title: 'Your Name as a Heading',
    filename: 'index.html',
    instructions: `
      <p>Welcome to <strong>CodeQuest</strong>! 🎉 You're going to build a real portfolio website step by step.</p>
      <p>Every webpage is made of <strong>HTML tags</strong>. They look like this:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">&lt;h1&gt;Your text here&lt;/h1&gt;</pre>
      <p>The <code>&lt;h1&gt;</code> tag makes a big bold heading — perfect for your name.</p>
      <p><strong>Task:</strong> Type <code>&lt;h1&gt;</code>, write your name, then close it with <code>&lt;/h1&gt;</code>.</p>
    `,
    hint: `<h1>Your Name</h1>`,
    starterCode: `<!-- Type your heading below. Replace "Your Name" with your name! -->
`,
    checkFn: (code) => /<h1[^>]*>.+<\/h1>/i.test(code),
    xp: 100,
    successMessage: "You wrote HTML! The browser read your tag and made it a heading. That's literally how every website starts."
  },

  {
    id: 2,
    chapter: 'HTML',
    title: 'Add a Job Title & Bio',
    filename: 'index.html',
    instructions: `
      <p>Nice work! Now let's add two more tags.</p>
      <p><code>&lt;h2&gt;</code> makes a smaller subheading — good for your job title.<br>
         <code>&lt;p&gt;</code> makes a paragraph — good for a short bio.</p>
      <p><strong>Task:</strong> Keep your <code>&lt;h1&gt;</code> and add:<br>
        • An <code>&lt;h2&gt;</code> with your job title (e.g. <em>Web Developer</em>)<br>
        • A <code>&lt;p&gt;</code> with one sentence about yourself</p>
    `,
    hint: `<h1>Your Name</h1>
<h2>Web Developer</h2>
<p>I love building websites and turning ideas into reality with code.</p>`,
    starterCode: `<h1>Your Name</h1>

<!-- Add h2 and p below -->
`,
    checkFn: (code) =>
      /<h1[^>]*>.+<\/h1>/i.test(code) &&
      /<h2[^>]*>.+<\/h2>/i.test(code) &&
      /<p[^>]*>.+<\/p>/i.test(code),
    xp: 110,
    successMessage: 'Your page now has a heading, job title, and bio. Three tags in and already looking like a real portfolio!'
  },

  {
    id: 3,
    chapter: 'HTML',
    title: 'Add a Profile Photo',
    filename: 'index.html',
    instructions: `
      <p>Let's add a photo! The <code>&lt;img&gt;</code> tag shows an image.</p>
      <p>It uses two <strong>attributes</strong> — extra info inside the tag:</p>
      <ul>
        <li><code>src</code> — the web address of the image</li>
        <li><code>alt</code> — a text description (helps blind users)</li>
      </ul>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">&lt;img src="https://i.pravatar.cc/200" alt="My photo"&gt;</pre>
      <p><strong>Task:</strong> Add an <code>&lt;img&gt;</code> tag with <code>src</code> and <code>alt</code>. Put it above your <code>&lt;h1&gt;</code>.</p>
    `,
    hint: `<img src="https://i.pravatar.cc/200" alt="Profile photo">
<h1>Your Name</h1>
<h2>Web Developer</h2>
<p>I love building websites and turning ideas into reality with code.</p>`,
    starterCode: `<!-- Add your img tag here, above the h1 -->

<h1>Your Name</h1>
<h2>Web Developer</h2>
<p>I love building websites and turning ideas into reality with code.</p>
`,
    checkFn: (code) =>
      (/<img[^>]+src=[\"'][^\"']+[\"'][^>]*alt=[\"'][^\"']*[\"']/i.test(code) ||
       /<img[^>]+alt=[\"'][^\"']*[\"'][^>]*src=[\"'][^\"']+[\"']/i.test(code)),
    xp: 120,
    successMessage: 'Profile photo added! Your portfolio is already looking personal and professional.'
  },

  {
    id: 4,
    chapter: 'HTML',
    title: 'Build a Skills List',
    filename: 'index.html',
    instructions: `
      <p>Every portfolio has a skills list. Use the <code>&lt;ul&gt;</code> and <code>&lt;li&gt;</code> tags:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">&lt;ul&gt;
  &lt;li&gt;HTML&lt;/li&gt;
  &lt;li&gt;CSS&lt;/li&gt;
&lt;/ul&gt;</pre>
      <p><code>&lt;ul&gt;</code> = the list container. <code>&lt;li&gt;</code> = each list item.</p>
      <p><strong>Task:</strong> Add an <code>&lt;h2&gt;</code> that says <em>My Skills</em> and a <code>&lt;ul&gt;</code> with at least 3 skills in <code>&lt;li&gt;</code> tags.</p>
    `,
    hint: `<img src="https://i.pravatar.cc/200" alt="Profile photo">
<h1>Your Name</h1>
<h2>Web Developer</h2>
<p>I love building websites and turning ideas into reality with code.</p>

<h2>My Skills</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>`,
    starterCode: `<img src="https://i.pravatar.cc/200" alt="Profile photo">
<h1>Your Name</h1>
<h2>Web Developer</h2>
<p>I love building websites and turning ideas into reality with code.</p>

<!-- Add your h2 "My Skills" and ul below -->
`,
    checkFn: (code) =>
      /<h2[^>]*>[^<]*[Ss]kill/i.test(code) &&
      /<ul[^>]*>/i.test(code) &&
      (code.match(/<li[^>]*>.+?<\/li>/gi) || []).length >= 3,
    xp: 130,
    successMessage: "Skills listed! Recruiters look at skills first. You just made your portfolio more impressive."
  },

  {
    id: 5,
    chapter: 'HTML',
    title: 'Add Navigation Links',
    filename: 'index.html',
    instructions: `
      <p>Links let visitors jump around your page. The <code>&lt;a&gt;</code> tag makes a link:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">&lt;a href="#skills"&gt;Skills&lt;/a&gt;</pre>
      <p>The <code>href="#skills"</code> links to any element with <code>id="skills"</code> on the page.</p>
      <p>Wrap links in a <code>&lt;nav&gt;</code> tag — it tells the browser this is navigation.</p>
      <p><strong>Task:</strong> Add a <code>&lt;nav&gt;</code> below your <code>&lt;h2&gt;Web Developer&lt;/h2&gt;</code> with at least 2 links.</p>
    `,
    hint: `<img src="https://i.pravatar.cc/200" alt="Profile photo">
<h1>Your Name</h1>
<h2>Web Developer</h2>
<nav>
  <a href="#skills">Skills</a>
  <a href="#contact">Contact</a>
</nav>
<p>I love building websites and turning ideas into reality with code.</p>

<h2>My Skills</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>`,
    starterCode: `<img src="https://i.pravatar.cc/200" alt="Profile photo">
<h1>Your Name</h1>
<h2>Web Developer</h2>

<!-- Add your nav with links here -->

<p>I love building websites and turning ideas into reality with code.</p>

<h2>My Skills</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
`,
    checkFn: (code) =>
      /<nav[^>]*>/i.test(code) &&
      (code.match(/<a\s[^>]*href[^>]*>[^<]+<\/a>/gi) || []).length >= 2,
    xp: 130,
    successMessage: 'Navigation added! The href attribute is how all links work on the entire internet.'
  },

  {
    id: 6,
    chapter: 'HTML',
    title: 'Add Page Sections',
    filename: 'index.html',
    instructions: `
      <p>Real pages are organized into sections. Three useful tags:</p>
      <ul>
        <li><code>&lt;header&gt;</code> — the top of the page (name, nav, photo)</li>
        <li><code>&lt;main&gt;</code> — the main content</li>
        <li><code>&lt;footer&gt;</code> — the bottom (copyright, etc.)</li>
      </ul>
      <p><strong>Task:</strong> Wrap your content:<br>
        • Put the photo, name, role, and nav inside <code>&lt;header&gt;</code><br>
        • Put the bio and skills inside <code>&lt;main&gt;</code><br>
        • Add a <code>&lt;footer&gt;</code> with a copyright line</p>
    `,
    hint: `<header>
  <img src="https://i.pravatar.cc/200" alt="Profile photo">
  <h1>Your Name</h1>
  <h2>Web Developer</h2>
  <nav>
    <a href="#skills">Skills</a>
    <a href="#contact">Contact</a>
  </nav>
</header>

<main>
  <p>I love building websites and turning ideas into reality with code.</p>

  <h2 id="skills">My Skills</h2>
  <ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
  </ul>
</main>

<footer>
  <p>© 2024 Your Name</p>
</footer>`,
    starterCode: `<!-- Wrap everything in header, main, and footer -->

<img src="https://i.pravatar.cc/200" alt="Profile photo">
<h1>Your Name</h1>
<h2>Web Developer</h2>
<nav>
  <a href="#skills">Skills</a>
  <a href="#contact">Contact</a>
</nav>

<p>I love building websites and turning ideas into reality with code.</p>

<h2>My Skills</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>

<p>© 2024 Your Name</p>
`,
    checkFn: (code) =>
      /<header[^>]*>/i.test(code) &&
      /<main[^>]*>/i.test(code) &&
      /<footer[^>]*>/i.test(code),
    xp: 150,
    successMessage: 'Great structure! Semantic tags help search engines and screen readers understand your page.'
  },

  {
    id: 7,
    chapter: 'HTML',
    title: 'Complete HTML Document',
    filename: 'index.html',
    instructions: `
      <p>Every real HTML file needs a proper document shell. Here's the template:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0;overflow:auto">&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;title&gt;My Portfolio&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  ...your content here...
&lt;/body&gt;
&lt;/html&gt;</pre>
      <p><strong>Task:</strong> Write this full shell and put all your portfolio content inside <code>&lt;body&gt;</code>.</p>
    `,
    hint: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Name – Web Developer</title>
</head>
<body>

  <header>
    <img src="https://i.pravatar.cc/200" alt="Profile photo">
    <h1>Your Name</h1>
    <h2>Web Developer</h2>
    <nav>
      <a href="#skills">Skills</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main>
    <p>I love building websites and turning ideas into reality with code.</p>

    <h2 id="skills">My Skills</h2>
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>JavaScript</li>
    </ul>

    <section id="contact">
      <h2>Contact</h2>
      <p>Email me: <a href="mailto:you@example.com">you@example.com</a></p>
    </section>
  </main>

  <footer>
    <p>© 2024 Your Name</p>
  </footer>

</body>
</html>`,
    starterCode: `<!-- Write the full document shell here -->
`,
    checkFn: (code) =>
      /<!doctype\s+html>/i.test(code) &&
      /<html[^>]*>/i.test(code) &&
      /<head[^>]*>/i.test(code) &&
      /<title[^>]*>.+<\/title>/i.test(code) &&
      /<body[^>]*>/i.test(code),
    xp: 200,
    successMessage: 'HTML complete! You just wrote the same structure used by every website on the internet. CSS chapter unlocked — time to make it beautiful! 🎨'
  },

  /* ════════════════════════════════════════════
     CSS  ·  Levels 8 – 14
     ════════════════════════════════════════════ */

  {
    id: 8,
    chapter: 'CSS',
    title: 'Dark Background & Text Color',
    filename: 'style.css',
    instructions: `
      <p>CSS makes your HTML look great. A CSS rule looks like:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">selector {
  property: value;
}</pre>
      <p>The <strong>selector</strong> picks which HTML element to style.<br>
         You write as many <code>property: value;</code> pairs as you want inside <code>{ }</code>.</p>
      <p><strong>Task:</strong> Write a rule for <code>body</code> that sets a dark <code>background-color</code> and a light <code>color</code> for the text.</p>
    `,
    hint: `body {
  background-color: #0d1117;
  color: #e6edf3;
  font-family: sans-serif;
}`,
    starterCode: `/* Style the body here */
body {

}`,
    checkFn: (code) =>
      /body\s*\{[^}]*background(-color)?\s*:[^}]+\}/i.test(code) &&
      /body\s*\{[^}]*color\s*:[^}]+\}/i.test(code),
    xp: 100,
    successMessage: "Dark theme activated! Dark backgrounds are easy on the eyes and look super professional. The transformation is already visible!"
  },

  {
    id: 9,
    chapter: 'CSS',
    title: 'Style the Heading',
    filename: 'style.css',
    instructions: `
      <p>Let's make your name heading look amazing with a <strong>gradient color</strong>.</p>
      <p>Add these properties to an <code>h1</code> rule:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">h1 {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #58a6ff, #bc8cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}</pre>
      <p><strong>Task:</strong> Copy the rule above into your CSS. You can change the colors if you like!</p>
    `,
    hint: `body {
  background-color: #0d1117;
  color: #e6edf3;
  font-family: sans-serif;
  margin: 0;
  padding: 0;
}

h1 {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #58a6ff, #bc8cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

h2 {
  color: #58a6ff;
  font-size: 1.2rem;
  font-weight: 400;
  margin: 4px 0 0 0;
}`,
    starterCode: `body {
  background-color: #0d1117;
  color: #e6edf3;
  font-family: sans-serif;
  margin: 0;
  padding: 0;
}

/* Add h1 and h2 styles below */
`,
    checkFn: (code) =>
      /h1\s*\{[^}]+\}/i.test(code) &&
      /h2\s*\{[^}]+\}/i.test(code),
    xp: 130,
    successMessage: 'Gradient text! This is a modern CSS trick used on top portfolio sites. Your name now looks like a professional brand.'
  },

  {
    id: 10,
    chapter: 'CSS',
    title: 'Style the Header Layout',
    filename: 'style.css',
    instructions: `
      <p><strong>Flexbox</strong> is how you arrange things side by side. One property does it:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">header {
  display: flex;
  align-items: center;
  gap: 20px;
}</pre>
      <p>Also make the profile photo round with <code>border-radius: 50%</code>.</p>
      <p><strong>Task:</strong> Add a <code>header</code> rule using flexbox, and a <code>header img</code> rule making the photo circular with a glowing border.</p>
    `,
    hint: `header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px 5%;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

header img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #58a6ff;
  box-shadow: 0 0 16px rgba(88,166,255,0.4);
  object-fit: cover;
}`,
    starterCode: `/* Keep your previous styles above and add below */

header {

}

header img {

}`,
    checkFn: (code) =>
      /header\s*\{[^}]*display\s*:\s*flex/i.test(code) &&
      /header\s+img\s*\{[^}]*border-radius/i.test(code),
    xp: 150,
    successMessage: 'Flexbox! Now the photo and name sit side by side. This is how every modern nav bar is built.'
  },

  {
    id: 11,
    chapter: 'CSS',
    title: 'Style the Navigation',
    filename: 'style.css',
    instructions: `
      <p>Let's style those nav links to look like real buttons with hover effects.</p>
      <p>Use <code>nav a:hover</code> to style what happens when the mouse hovers:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">nav a:hover {
  color: #58a6ff;
}</pre>
      <p><strong>Task:</strong> Style <code>nav</code> with flexbox, style <code>nav a</code> to remove underline and add padding, and add a <code>nav a:hover</code> rule.</p>
    `,
    hint: `nav {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

nav a {
  text-decoration: none;
  color: #8b949e;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  transition: all 0.2s;
}

nav a:hover {
  color: #58a6ff;
  border-color: #58a6ff;
  background: rgba(88,166,255,0.1);
}`,
    starterCode: `nav {

}

nav a {

}

nav a:hover {

}`,
    checkFn: (code) =>
      /nav\s*\{[^}]*display\s*:\s*flex/i.test(code) &&
      /nav\s+a\s*\{[^}]+\}/i.test(code) &&
      /nav\s+a\s*:\s*hover\s*\{[^}]+\}/i.test(code),
    xp: 140,
    successMessage: "Hover effects! The transition property makes it silky smooth. That's what makes sites feel polished and professional."
  },

  {
    id: 12,
    chapter: 'CSS',
    title: 'Style the Main Content',
    filename: 'style.css',
    instructions: `
      <p>Center your content and make your skills appear as cool pill badges.</p>
      <p>Use <code>max-width</code> + <code>margin: auto</code> to center a block:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">main {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 5%;
}</pre>
      <p><strong>Task:</strong> Add rules for <code>main</code> (centered, with padding) and <code>li</code> (styled as pill badges).</p>
    `,
    hint: `main {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 5%;
}

ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

li {
  background: rgba(88,166,255,0.1);
  color: #58a6ff;
  border: 1px solid rgba(88,166,255,0.35);
  border-radius: 20px;
  padding: 6px 18px;
  font-size: 0.88rem;
  font-weight: 600;
}`,
    starterCode: `main {

}

ul {

}

li {

}`,
    checkFn: (code) =>
      /main\s*\{[^}]*max-width/i.test(code) &&
      /main\s*\{[^}]*margin[^}]*auto/i.test(code) &&
      /li\s*\{[^}]+\}/i.test(code),
    xp: 160,
    successMessage: 'Pill badges! Your skills now look exactly like GitHub and LinkedIn skill tags. Very professional.'
  },

  {
    id: 13,
    chapter: 'CSS',
    title: 'Add a Project Card',
    filename: 'style.css',
    instructions: `
      <p>Every portfolio needs projects. Let's style a project card with a hover effect.</p>
      <p>Your HTML already has <code>&lt;section class="project-card"&gt;</code> elements waiting to be styled.</p>
      <p><strong>Task:</strong> Add a <code>.project-card</code> rule with a dark background, border, and border-radius. Then add a <code>.project-card:hover</code> rule that moves it up with <code>transform: translateY(-4px)</code>.</p>
    `,
    hint: `.project-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
  transition: all 0.25s ease;
}

.project-card:hover {
  border-color: #58a6ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(88,166,255,0.15);
}

.project-card h3 {
  color: #e6edf3;
  margin-bottom: 8px;
}

.project-card p {
  color: #8b949e;
  font-size: 0.9rem;
  line-height: 1.6;
}`,
    starterCode: `.project-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
  /* add transition */
}

.project-card:hover {
  /* add hover effect */
}`,
    checkFn: (code) =>
      /\.project-card\s*\{[^}]+\}/i.test(code) &&
      /\.project-card\s*:\s*hover\s*\{[^}]+\}/i.test(code),
    xp: 170,
    successMessage: 'Project cards with hover lift! This is the #1 visual trick on portfolio sites. Now every project you add looks amazing.'
  },

  {
    id: 14,
    chapter: 'CSS',
    title: 'Style the Footer',
    filename: 'style.css',
    instructions: `
      <p>Last CSS step — a polished footer to finish the page.</p>
      <p><strong>Task:</strong> Style the <code>footer</code> with a dark background, a top border, centered text, and some padding. Keep it simple!</p>
    `,
    hint: `footer {
  background: #0d1117;
  border-top: 1px solid #30363d;
  text-align: center;
  padding: 32px 20px;
  color: #484f58;
  font-size: 0.88rem;
  margin-top: 60px;
}`,
    starterCode: `footer {

}`,
    checkFn: (code) =>
      /footer\s*\{[^}]*background[^}]+\}/i.test(code) &&
      /footer\s*\{[^}]*padding[^}]+\}/i.test(code),
    xp: 200,
    successMessage: "CSS done! Your portfolio looks stunning — dark theme, gradient heading, glowing photo, pill badges, hover cards. Time for JavaScript to make it interactive! ⚡"
  },

  {
    id: 15,
    chapter: 'JS',
    title: 'Your First JavaScript',
    filename: 'script.js',
    instructions: `
      <p><strong>JavaScript</strong> makes your page do things — respond to clicks, show messages, change content.</p>
      <p>The two most basic outputs are:</p>
      <ul>
        <li><code>console.log("hello")</code> — prints to the browser console</li>
        <li><code>alert("hello")</code> — shows a popup</li>
      </ul>
      <p><strong>Task:</strong> Write one <code>console.log()</code> and one <code>alert()</code>. Type any message you like inside the quotes.</p>
    `,
    hint: `console.log("Portfolio loaded!");
alert("Welcome to my portfolio!");`,
    starterCode: `// Write your JavaScript below
`,
    checkFn: (code) =>
      /console\.log\s*\(\s*["'`].+["'`]\s*\)/i.test(code) &&
      /alert\s*\(\s*["'`].+["'`]\s*\)/i.test(code),
    xp: 100,
    successMessage: "JavaScript is running! You'll use console.log every single day as a developer — it's how you check if your code is working."
  },

  {
    id: 16,
    chapter: 'JS',
    title: 'Variables',
    filename: 'script.js',
    instructions: `
      <p>Variables store information. Use <code>const</code> for values that don't change:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">const myName = "Your Name";
console.log(myName);</pre>
      <p>Use <code>let</code> for values that might change later.</p>
      <p><strong>Task:</strong> Create a <code>const</code> called <code>myName</code> with your name, a <code>let</code> called <code>myAge</code> with your age, and log both.</p>
    `,
    hint: `const myName = "Your Name";
let myAge = 24;

console.log(myName);
console.log(myAge);`,
    starterCode: `// Create variables here
`,
    checkFn: (code) =>
      /const\s+myName\s*=/.test(code) &&
      /let\s+myAge\s*=/.test(code),
    xp: 110,
    successMessage: "Variables are how programs remember things. You just stored your own identity in code!"
  },

  {
    id: 17,
    chapter: 'JS',
    title: 'Select & Change an Element',
    filename: 'script.js',
    instructions: `
      <p>JavaScript can reach into your HTML and change it. Use <code>document.querySelector()</code> to select an element:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">const heading = document.querySelector('h1');
heading.textContent = "New text here";</pre>
      <p><strong>Task:</strong> Select the <code>h1</code> element and change its text to your name using <code>.textContent</code>.</p>
    `,
    hint: `const heading = document.querySelector('h1');
heading.textContent = "Your Name";

console.log("Heading changed to: " + heading.textContent);`,
    starterCode: `// Select and change the h1
`,
    checkFn: (code) =>
      /document\.querySelector\s*\(/.test(code) &&
      /\.textContent\s*=/.test(code),
    xp: 120,
    successMessage: "DOM manipulation! This is how every web app works — React, Angular, Vue all do exactly this under the hood."
  },

  {
    id: 18,
    chapter: 'JS',
    title: 'Change Styles with JavaScript',
    filename: 'script.js',
    instructions: `
      <p>You can change CSS styles from JavaScript using <code>element.style</code>:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">const heading = document.querySelector('h1');
heading.style.color = "red";</pre>
      <p><strong>Task:</strong> Select the <code>footer</code> and change its <code>style.textContent</code> to update the copyright year dynamically using <code>new Date().getFullYear()</code>.</p>
    `,
    hint: `const footer = document.querySelector('footer p');
const year = new Date().getFullYear();
footer.textContent = "© " + year + " Your Name · Made with love 💙";

// Also make the footer text slightly lighter
footer.style.color = "#6e7681";`,
    starterCode: `// Update the footer copyright year
`,
    checkFn: (code) =>
      /document\.querySelector/.test(code) &&
      (/\.textContent\s*=/.test(code) || /\.style\./.test(code)),
    xp: 130,
    successMessage: "The year auto-updates every year without you changing anything. That's the magic of dynamic code!"
  },

  {
    id: 19,
    chapter: 'JS',
    title: 'Click Event Listener',
    filename: 'script.js',
    instructions: `
      <p>Events let your page react to what the user does. <code>addEventListener</code> listens for events:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">const btn = document.querySelector('button');
btn.addEventListener('click', function() {
  console.log("clicked!");
});</pre>
      <p><strong>Task:</strong> Select the <code>header img</code> (profile photo) and add a <code>'click'</code> event listener that logs <em>"Hi there!"</em> when clicked.</p>
    `,
    hint: `const photo = document.querySelector('header img');

photo.style.cursor = 'pointer';

photo.addEventListener('click', function() {
  console.log("Hi there!");
  alert("👋 Hi! I'm Your Name. Nice to meet you!");
});`,
    starterCode: `// Add a click event to the profile photo
`,
    checkFn: (code) =>
      /addEventListener\s*\(\s*['"`]click['"`]/.test(code),
    xp: 140,
    successMessage: "Click the photo to see it work! Events are the foundation of all interactivity — buttons, forms, animations, all of it."
  },

  {
    id: 20,
    chapter: 'JS',
    title: 'Write a Function',
    filename: 'script.js',
    instructions: `
      <p>A <strong>function</strong> is a reusable block of code. Define it once, use it anywhere:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">function sayHello(name) {
  return "Hello, " + name + "!";
}
console.log(sayHello("World"));</pre>
      <p><strong>Task:</strong> Write a function called <code>greetUser</code> that takes a <code>name</code> and returns a greeting string. Call it and log the result.</p>
    `,
    hint: `function greetUser(name) {
  return "Hello, " + name + "! Welcome to my portfolio.";
}

console.log(greetUser("Visitor"));
console.log(greetUser("Recruiter"));`,
    starterCode: `// Define a greetUser function
`,
    checkFn: (code) =>
      /function\s+greetUser\s*\(/.test(code) &&
      /return\s+/.test(code) &&
      /greetUser\s*\(/.test(code),
    xp: 140,
    successMessage: "Functions are the building blocks of every program. You'll write thousands of them throughout your career!"
  },

  {
    id: 21,
    chapter: 'JS',
    title: 'If / Else Decisions',
    filename: 'script.js',
    instructions: `
      <p>Code needs to make decisions. The <code>if/else</code> statement runs different code based on a condition:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">if (time < 12) {
  console.log("Good morning!");
} else {
  console.log("Good afternoon!");
}</pre>
      <p><strong>Task:</strong> Use <code>new Date().getHours()</code> to get the current hour, then use <code>if/else</code> to log a greeting based on the time of day.</p>
    `,
    hint: `const hour = new Date().getHours();

if (hour < 12) {
  console.log("Good morning! ☀️");
} else if (hour < 18) {
  console.log("Good afternoon! 🌤");
} else {
  console.log("Good evening! 🌙");
}`,
    starterCode: `// Use if/else to greet based on time of day
`,
    checkFn: (code) =>
      /if\s*\(/.test(code) &&
      /else/.test(code),
    xp: 150,
    successMessage: "With if/else your code can handle any situation. Every app you've ever used is built on thousands of these decisions."
  },

  {
    id: 22,
    chapter: 'JS',
    title: 'Arrays & Loops',
    filename: 'script.js',
    instructions: `
      <p>Arrays store lists of items. Loops go through each item one by one:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">const skills = ["HTML", "CSS", "JS"];
skills.forEach(function(skill) {
  console.log(skill);
});</pre>
      <p><strong>Task:</strong> Create a <code>const</code> called <code>mySkills</code> with at least 3 skills and use <code>forEach</code> to log each one.</p>
    `,
    hint: `const mySkills = ["HTML", "CSS", "JavaScript", "Problem Solving"];

mySkills.forEach(function(skill) {
  console.log(skill);
});`,
    starterCode: `// Create an array and loop through it
`,
    checkFn: (code) =>
      /const\s+mySkills\s*=\s*\[/.test(code) &&
      /forEach\s*\(/.test(code),
    xp: 160,
    successMessage: "Arrays + loops = data power! This is how every list on the web — products, posts, tweets — gets displayed."
  },

  {
    id: 23,
    chapter: 'JS',
    title: 'Add a Dark Mode Button',
    filename: 'script.js',
    instructions: `
      <p>Let's add a real dark/light mode toggle! Use <code>classList.toggle()</code> to add or remove a CSS class:</p>
      <pre style="background:#0a0c10;padding:10px;border-radius:6px;font-size:0.82em;color:#e2e8f8;margin:8px 0">document.body.classList.toggle('light-mode');</pre>
      <p><strong>Task:</strong> Create a <code>&lt;button&gt;</code> with JavaScript, add it to the page, and give it a click listener that toggles a <code>light-mode</code> class on <code>document.body</code>.</p>
    `,
    hint: `// Create toggle button
const btn = document.createElement('button');
btn.textContent = "☀️ Light Mode";
btn.style.cssText = "position:fixed; top:16px; right:16px; padding:8px 16px; border-radius:8px; border:1px solid #30363d; background:#161b22; color:#e6edf3; cursor:pointer; font-size:0.9rem; z-index:999;";

document.body.appendChild(btn);

// Toggle on click
btn.addEventListener('click', function() {
  document.body.classList.toggle('light-mode');
  btn.textContent = document.body.classList.contains('light-mode') ? "🌙 Dark Mode" : "☀️ Light Mode";
});

// Light mode styles
const style = document.createElement('style');
style.textContent = \`
  body.light-mode { background-color: #ffffff !important; color: #1c2128 !important; }
  body.light-mode header { background: #f6f8fa !important; border-color: #d0d7de !important; }
  body.light-mode footer { border-color: #d0d7de !important; }
\`;
document.head.appendChild(style);`,
    starterCode: `// Create a dark/light mode toggle button
`,
    checkFn: (code) =>
      /createElement\s*\(\s*['"`]button['"`]\s*\)/.test(code) &&
      /classList\.(toggle|add|remove)/.test(code) &&
      /addEventListener/.test(code),
    xp: 180,
    successMessage: "Dark mode toggle built from scratch! Click the button in your preview. This feature is on every modern website."
  },

  {
    id: 24,
    chapter: 'JS',
    title: 'Final Level — Finish Your Portfolio!',
    filename: 'script.js',
    instructions: `
      <p>🏆 <strong>Final Level!</strong> Pull it all together.</p>
      <p>Write JavaScript that does all of these:</p>
      <ul>
        <li>Select <code>h1</code> and set its text to your name with <code>.textContent</code></li>
        <li>Create a <code>mySkills</code> array and use <code>forEach</code> to log each skill</li>
        <li>Use <code>classList.toggle</code> somewhere (can re-use the dark mode idea)</li>
        <li>Log <em>"Portfolio loaded!"</em> with <code>console.log</code></li>
      </ul>
    `,
    hint: `console.log("Portfolio loaded!");

// Set your name
const h1 = document.querySelector('h1');
if (h1) h1.textContent = "Your Name";

// Skills array
const mySkills = ["HTML", "CSS", "JavaScript", "Problem Solving"];
mySkills.forEach(function(skill) {
  console.log(skill);
});

// Dark mode toggle button
const btn = document.createElement('button');
btn.textContent = "☀️ Light Mode";
btn.style.cssText = "position:fixed; top:16px; right:16px; padding:8px 16px; border-radius:8px; border:1px solid #30363d; background:#161b22; color:#e6edf3; cursor:pointer; font-size:0.9rem; z-index:999;";
document.body.appendChild(btn);
btn.addEventListener('click', function() {
  document.body.classList.toggle('light-mode');
  btn.textContent = document.body.classList.contains('light-mode') ? "🌙 Dark Mode" : "☀️ Light Mode";
});

// Light mode CSS
const style = document.createElement('style');
style.textContent = \`
  body.light-mode { background-color: #ffffff !important; color: #1c2128 !important; }
  body.light-mode header { background: #f6f8fa !important; border-color: #d0d7de !important; }
  body.light-mode footer { border-color: #d0d7de !important; }
\`;
document.head.appendChild(style);`,
    starterCode: `// Final level — combine everything!
`,
    checkFn: (code) =>
      /querySelector\s*\(\s*['"`]h1['"`]\s*\)/.test(code) &&
      /const\s+mySkills\s*=\s*\[/.test(code) &&
      /forEach/.test(code) &&
      /classList\.(toggle|add|remove)/.test(code) &&
      /console\.log/.test(code),
    xp: 300,
    successMessage: "🏆 YOU DID IT! You built a complete, professional portfolio website from scratch — HTML structure, CSS dark theme with animations, and JavaScript interactivity. You are a web developer. For real. Go build something amazing!"
  }

];

/* ─────────────────────────────────────────
   SHARED STATE
   Pre-loaded with a beautiful portfolio so
   the preview always looks great from level 8+
   ───────────────────────────────────────── */
const STATE = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Name – Web Developer</title>
</head>
<body>
  <header>
    <img src="https://i.pravatar.cc/200" alt="Profile photo">
    <div>
      <h1>Your Name</h1>
      <h2>Web Developer</h2>
    </div>
    <nav>
      <a href="#skills">Skills</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main>
    <p>I love building websites and turning ideas into reality with code.</p>

    <h2 id="skills">My Skills</h2>
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>JavaScript</li>
    </ul>

    <h2 id="projects">Projects</h2>

    <section class="project-card">
      <h3>Portfolio Website</h3>
      <p>A responsive personal portfolio built from scratch with HTML, CSS, and JavaScript.</p>
    </section>

    <section class="project-card">
      <h3>Weather App</h3>
      <p>A live weather dashboard using a public API with dynamic data and clean UI.</p>
    </section>

    <section id="contact" class="project-card">
      <h3>Contact</h3>
      <p>Open to work! Email: <a href="mailto:you@example.com" style="color:#58a6ff">you@example.com</a></p>
    </section>
  </main>

  <footer>
    <p>© 2024 Your Name · Built with code & coffee ☕</p>
  </footer>
</body>
</html>`,
  css: `* { box-sizing: border-box; margin: 0; padding: 0; }\nbody { background-color: #0d1117; color: #e6edf3; font-family: sans-serif; line-height: 1.7; }`,
  js: `console.log("Portfolio loading...");`,
  completedLevels: []
};
