# CodeQuest

**Learn to build websites from scratch: HTML to CSS to JavaScript**

CodeQuest is a browser-based coding game with 24 progressive levels. Learners sign in, choose a mentor, write code in the editor, and see their portfolio take shape in the live preview.

---

## How to Play

1. Open `index.html` in your browser, or serve the folder with a local web server.
2. Sign in or create a local CodeQuest account.
3. Choose a mentor voice.
4. Read the instructions on the left.
5. Write your code in the editor.
6. Click **Run Code** or press **Ctrl+Enter** to check your answer.
7. Complete all 24 levels to build a portfolio website.

---

## Level Structure

| Levels | Topic | What You Learn |
|--------|-------|----------------|
| 1-7    | HTML  | Tags, attributes, links, images, semantic structure |
| 8-14   | CSS   | Selectors, box model, flexbox, hover effects |
| 15-24  | JS    | Variables, DOM, events, functions, loops, forms |

---

## Features

- **24 progressive levels** that build on each other.
- **Structured validation** using DOM, CSSOM, and JavaScript syntax checks where possible.
- **Live preview** rendered inside a sandboxed iframe.
- **Central app state** through `js/state.js`, persisted in localStorage.
- **Local sign-in** for separating progress by learner on the same browser.
- **Hints and points** for guided help.
- **Mentor voice picker** with pixel-art portraits.
- **AI helper panel** with optional OpenAI-compatible API wiring.
- **Certificate and finished-code downloads** after completion.

---

## Security Notes

- Accounts are local-only and stored in browser storage for demo/learning use.
- Passwords are stored as SHA-256 hashes in local storage; this is not equivalent to server-side authentication.
- Do not use real personal passwords in this project.
- Progress, sessions, and hint points are all browser-local and can be cleared by wiping site data.
- Third-party scripts (TTS) are loaded from CDNs; for stricter environments, self-host these assets.

---

## Running Locally

### Option 1: Open the file

```text
double-click index.html
```

### Option 2: VS Code Live Server

1. Install the Live Server extension in VS Code.
2. Right-click `index.html`.
3. Choose **Open with Live Server**.

### Option 3: Simple Python Server

```bash
python -m http.server 8080
# then open http://localhost:8080
```

---

## Architecture Notes

- `js/state.js` owns progress, learner code, XP, and completed levels.
- `js/validators.js` owns level validation.
- `js/game.js` owns rendering, navigation, preview, and win flow.
- `js/auth.js` provides local-only sign-in and signup persistence.
- `css/design-system.css` defines shared visual tokens and learning-workspace polish.

This project has no npm build step. Fonts and optional voice/animation libraries load from CDNs.
