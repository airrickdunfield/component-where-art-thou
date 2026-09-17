# Install guide: JSX Open in Code for Firefox

This guide connects a local Vite + React app to Firefox and VS Code. It is a
development tool: do not add the Vite plugin to a production build pipeline.

## What you need

- Firefox 121 or newer
- VS Code
- Node.js 20 or newer
- An existing Vite React app using `.jsx` or `.tsx` source files
- This repository available locally, referred to below as `TOOL_DIR`

For example, in this checkout `TOOL_DIR` is:

```txt
/Users/adunfield/Documents/ChatGPT/JSX Open in Code
```

## 1. Install the Vite plugin in your React app

In a terminal, change to your React app folder and install the local plugin:

```sh
npm install --save-dev @airrickdunfield/vite-plugin-jsx-locator
```

Edit your app's `vite.config.js` or `vite.config.ts`:

```js
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

Add this to your personal `.env.local` file, then restart Vite:

```txt
JSX_OPEN_IN_CODE=true
```

Start the application as usual:

```sh
npm run dev
```

Open the local address Vite prints, such as `http://localhost:5173`, in Firefox.
The current Firefox extension intentionally runs only on `localhost` and
`127.0.0.1` pages.

## 2. Prepare the VS Code extension

Open this folder in VS Code:

```txt
TOOL_DIR/packages/vscode-extension
```

If you opened `TOOL_DIR` (the project root) instead, that is fine too: select
**Run JSX Open in Code extension** in VS Code's Run and Debug view. The included
debug configuration points VS Code at the correct extension subfolder.

Open VS Code's integrated terminal there and install its development dependencies:

```sh
npm install
```

Press `F5` (or run **Debug: Start Debugging**). VS Code opens an **Extension
Development Host** window with the local extension running.

### Important: open your React app in that window

The extension only opens files that belong to an open VS Code workspace. In the
new Extension Development Host window, choose **File → Open Folder…** and open
your React app's root folder. Alternatively, add that folder to a multi-root
workspace. This is both required for the tool to work and prevents a webpage from
opening arbitrary files on your computer.

In that Extension Development Host window, open the Command Palette and run:

```txt
JSX Open in Code: Generate Browser Token
```

The extension copies a new secret token to the clipboard. Keep the Extension
Development Host open while using the Firefox inspector.

## 3. Load the Firefox extension

1. In Firefox, navigate to `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on…**.
3. Choose this file:

   ```txt
   TOOL_DIR/packages/browser-extension/manifest.json
   ```

4. Navigate back to your local Vite app.
5. Click the **JSX Open in Code (Firefox)** toolbar icon. You may need to find
   it in Firefox's extensions menu and pin it to the toolbar first.
6. Paste the generated browser token and choose **Save token and inspect**.

After the first setup, clicking the Firefox toolbar icon immediately enables
inspection and closes the popup. There is no separate inspect button.

Temporary extensions are removed when Firefox restarts. Repeat this section after
a restart. For a distributable extension, it will need to be packaged and signed
through Mozilla's add-on process.

## 4. Use it

1. With inspection enabled, move the pointer over a native element rendered from
   JSX, such as a button, heading, card, or `div`.
2. A green outline identifies the element that will be selected. A white label
   with a purple border appears above it and shows the source-file breadcrumb, such as
   `Router.jsx › UIKitSection.jsx`. If a source file has several functional
   components, its owning function appears after the filename—for example,
   `UIKitSection.jsx › FeatureCard()`.
3. Click it.
4. VS Code opens the relevant `.jsx` or `.tsx` file and places the cursor on the
   JSX opening tag.

The tool disables inspection after a successful selection, so ordinary page clicks
work immediately afterward. Enable it again from the toolbar for another lookup.

## Troubleshooting

### “Reload this local dev page, then try again.”

Refresh the Vite page after loading the temporary add-on, then click the toolbar
icon again. Firefox only injects the inspector script into pages that load after
the extension is available.

### Click shows an invalid token or cannot open error

Generate a new token in the Extension Development Host and paste it into the
Firefox popup again. Make sure the Extension Development Host remains running.

### Click does nothing or no green outline appears

Confirm all of the following:

- The page URL begins with `http://localhost` or `http://127.0.0.1`.
- Vite is running with `npm run dev`, not a production preview/build.
- `jsxLocator()` is present in your Vite config.
- You refreshed Firefox after starting Vite and loading the add-on.

### VS Code says the location is outside the workspace

Open the React app's root folder in the **Extension Development Host** window, not
only in your normal VS Code window. See the important note in step 2.

### A component opens a nearby DOM tag instead of its component definition

That is expected for this first version. It maps native rendered JSX tags to their
source locations. When components are nested, it opens the closest selected JSX
element rather than attempting to guess which component boundary you intended.
