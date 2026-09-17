# JSX Open in Code

A development-only toolchain for selecting rendered JSX in Firefox or Chromium and
opening its source in VS Code.

For a detailed Firefox setup, see [INSTALL.md](./INSTALL.md).

This project is released under the [MIT License](./LICENSE). Its local-only data
handling is described in [PRIVACY.md](./PRIVACY.md).

It has three pieces:

1. `packages/vite-plugin-jsx-locator` annotates native JSX elements with their
   source file and location while Vite is running in development mode.
2. `packages/browser-extension` provides a Firefox Manifest V3 inspector.
3. `packages/chromium-extension` provides the equivalent Chromium Manifest V3
   inspector.
4. `packages/vscode-extension` listens on localhost and opens the selected file.

The included artwork is used consistently for Firefox, Chromium, and VS Code
extension icons. The unchanged 1024×1024 master is stored at
`assets/component-where-are-thou.png`.

## How it works

1. When enabled, the Vite plugin adds development-only source metadata to native
   JSX tags (`div`, `button`, and so on).
2. The browser extension starts inspect mode when its toolbar icon is clicked.
   It draws a green outline around the nearest tagged element and shows its
   source-file breadcrumb in a white, purple-bordered chip.
3. Clicking the outline sends the file path and source location to the local VS
   Code extension.
4. The VS Code extension validates that the path belongs to an open workspace,
   opens the file at the JSX tag, and brings VS Code to the foreground on macOS.

For a source file that defines more than one capitalized functional component, the
breadcrumb includes the owning function—for example:

```txt
Router.jsx › Page() › UIKitSection.jsx › FeatureCard()
```

## Quick start

### 1. Add the Vite plugin to a React app

Install the Vite plugin:

```sh
npm install -D @airrickdunfield/vite-plugin-jsx-locator
```

```js
// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const jsxLocator = env.JSX_OPEN_IN_CODE === 'true'
    ? (await import('@airrickdunfield/vite-plugin-jsx-locator')).jsxLocator
    : null;

  return {
    plugins: [react(), ...(jsxLocator ? [jsxLocator()] : [])],
  };
});
```

Create a local, uncommitted `.env.local` in the React app:

```txt
JSX_OPEN_IN_CODE=true
```

Run your Vite app normally. The plugin only runs when that local opt-in is set and
Vite is serving; production build output is untouched. Developers without the
plugin installed can leave the variable unset and Vite will not try to import it.

### 2. Install the VS Code extension

Open `packages/vscode-extension` in VS Code, run `npm install`, then press `F5`.
In the Extension Development Host, run **JSX Open in Code: Generate Browser Token**
from the Command Palette. Copy the displayed token.

### 3. Load and configure a browser extension

#### Firefox

Open Firefox's `about:debugging#/runtime/this-firefox`, select **Load Temporary
Add-on**, and choose `packages/browser-extension/manifest.json`. Click its toolbar
icon, paste the token, and choose **Save token and inspect**. On later uses,
clicking the toolbar icon immediately begins inspection. Temporary add-ons
are removed when Firefox restarts; this is ideal for development. To distribute it,
package and sign it through Firefox Add-ons.

#### Chromium (Chrome, Edge, Brave, Arc)

Open `chrome://extensions` (or the equivalent extensions page), enable
**Developer mode**, choose **Load unpacked**, and select
`packages/chromium-extension`. Click the extension toolbar icon, paste the token,
and choose **Save token and inspect**. Later toolbar clicks immediately start
inspection.

Hover a rendered element and click it. The VS Code Extension Development Host opens
the corresponding JSX/TSX source location.

## Security model

The local listener binds only to `127.0.0.1`, requires a randomly generated token,
and refuses paths outside an open VS Code workspace. Do not expose its port beyond
your machine.

## Current scope

This MVP targets native DOM JSX elements (`div`, `button`, etc.) in Vite React apps
running in Firefox or Chromium browsers.
Nested components resolve to the closest rendered annotated element. A purple label
above the green outline shows source-file ancestry. When a file has multiple
functional components, the label includes its owner as `ComponentName()`. Support
for framework-specific component trees is a natural next step.
