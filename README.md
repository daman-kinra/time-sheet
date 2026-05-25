# Timesheet

Track tasks and time. Run as a web app or as a browser extension that replaces the new tab page.

## Development

```bash
npm install
npm run dev
```

## Web build

```bash
npm run build
```

Output: `dist/`

## Browser extension build

```bash
npm run build:extension
```

Output: `dist-extension/` (Chrome, Edge, and Firefox)

Data is stored in **IndexedDB** on the extension origin.

### Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `dist-extension` folder
4. Open a new tab

### Microsoft Edge

1. Open `edge://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `dist-extension` folder
4. Open a new tab

### Firefox

Requires `browser_specific_settings.gecko` in the manifest (included).

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Choose `manifest.json` inside `dist-extension`
4. Open a new tab

Temporary add-ons are removed when Firefox restarts. For a permanent install, publish or sign the extension via [Firefox Add-ons](https://addons.mozilla.org/).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production web build |
| `npm run build:extension` | Extension build for Chrome, Edge, Firefox |
| `npm run lint` | ESLint |
