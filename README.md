# CodeQuest 🎮

**Learn to build websites from scratch — HTML → CSS → JavaScript**

A browser-based coding game with 24 progressive levels. No installation needed. Just open `index.html` in any browser.

---

## How to Play

1. Open `index.html` in your browser (or use VS Code Live Server)
2. Click **Start Coding**
3. Read the instructions on the left
4. Write your code in the editor
5. Click **▶ Run Code** (or press **Ctrl+Enter**) to check your answer
6. Complete all 24 levels to build a real portfolio website!

---

## Level Structure

| Levels | Topic | What You Learn |
|--------|-------|----------------|
| 1–7    | HTML  | Tags, attributes, links, images, semantic structure |
| 8–14   | CSS   | Selectors, box model, flexbox, hover effects |
| 15–24  | JS    | Variables, DOM, events, functions, loops, forms |

---

## Features

- 🎯 **24 progressive levels** — each builds on the last
- ✅ **Instant code checking** — smart validation per level
- 👁️ **Live preview** — see your code render in real time
- 💡 **Hints** — unstuck yourself anytime
- 💾 **Auto-saves progress** — localStorage keeps your place
- ⚡ **XP system** — earn points as you complete levels
- 🎨 **Tab, HTML, CSS, JS views** — inspect the full page at any time
- 🗣️ **Voice guide picker** — choose one of four mentor portraits on the home screen
- 🤖 **AI helper bubble** — bottom-right chat assistant with optional AI API wiring
- ⌨️ **Smart editor** — tab key indents, auto-closes brackets
- 📱 **Responsive** — works on mobile too

---

## Running Locally

### Option 1: Just open the file
```
double-click index.html
```

### Option 2: VS Code Live Server (recommended)
1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

### Option 3: Simple Python server
```bash
python -m http.server 8080
# then open http://localhost:8080
```

---

## No Dependencies

This project uses zero npm packages. Pure HTML, CSS, and JavaScript.
The fonts load from Google Fonts (requires internet).

The AI helper is designed to call an OpenAI-compatible endpoint when you set `window.CODEQUEST_AI_ENDPOINT` and `window.CODEQUEST_AI_API_KEY` in the page, or you can keep using the built-in fallback hints.

---

## Built With

- Vanilla JS (ES6+)
- CSS custom properties
- LocalStorage for save data
- Blob URLs for iframe sandboxing

---

Made with ❤️ — inspired by [Flexbox Froggy](https://flexboxfroggy.com)
