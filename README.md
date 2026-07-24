# Tab Pin 📌

A tiny Chrome extension that pins or unpins the current tab — with a keyboard shortcut or a single click on the toolbar icon.

## Features

- **Keyboard shortcut** — `Ctrl+Shift+X` (`⌘+Shift+X` on Mac) toggles the pin on the active tab
- **Toolbar button** — click the pushpin icon to do the same
- No popup, no options page, no permissions beyond what pinning needs — the whole extension is one manifest and a ~15-line service worker

## Install

1. Clone or download this repo
2. Open `chrome://extensions` and enable **Developer mode** (top right)
3. Click **Load unpacked** and select the repo folder
4. Optional: pin the toolbar icon via the puzzle-piece menu

## Changing the shortcut

Go to `chrome://extensions/shortcuts` and rebind "Pin/unpin the current tab" to whatever you like. Note that Chrome only applies the suggested default at install time — if `Ctrl+Shift+X` is already taken by another extension, set it manually there.

## License

[MIT](LICENSE)
