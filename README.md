# Python Practice

Bright's beginner Python practice website, with eight editable lessons covering print, variables, input, .strip(), float, arithmetic, f-strings, and a practice pay calculator.

## Open the website

The GitHub Pages version is public. Use the website link in this repository's About section or Settings > Pages.

## Practice features

- Edit examples and run the beginner Python syntax taught here.
- Answer input() questions in the output panel.
- Read explanations beside the code and inspect variable values and types.
- Complete challenges with hints, solutions, and helpful feedback.
- Search the syntax dictionary whenever you need a reminder.
- Drafts and progress stay in your current browser; they do not sync across devices or website addresses.

The runner is a bounded beginner interpreter, not a full Python installation. Use Python in VS Code for full projects. Code and answers run locally in the browser.

## Hosting

This is a buildless static website. GitHub Pages serves the main branch from the repository root. Relative asset and module paths work under a project website address. The public copy does not include a login system.

The repository and GitHub Pages version are public with Bright's approval. The original Sites deployment keeps its existing private access. Changes to GitHub do not automatically update the Sites version.

## Run locally in VS Code

Open the folder in VS Code, then start a local server from its terminal.

Windows, with Python installed:

```sh
py -m http.server 8000
```

macOS or Linux:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Press Ctrl+C to stop the server. Serve the folder this way instead of double-clicking index.html, because it uses JavaScript modules.

## Developer checks

With Node.js and Python installed, run `npm test`. No npm dependencies are needed. The ten checks cover examples against CPython, every challenge solution, staged input, drafts, error messages, number formatting, and UI event handlers in a browserless DOM harness.
