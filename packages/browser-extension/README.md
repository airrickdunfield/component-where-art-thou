# JSX Open in Code for Firefox

This Firefox extension is one part of JSX Open in Code. It inspects local Vite
React pages and sends a user-selected JSX location to the companion VS Code
extension.

## Install from Firefox Add-ons

Install the published add-on from Firefox Add-ons, then:

1. Install **JSX Open in Code** in VS Code and open your React workspace.
2. Run **JSX Open in Code: Generate Browser Token** in VS Code.
3. Click the Firefox toolbar icon, paste the token once, and select **Save token
   and inspect**.
4. Start the React app with the optional Vite locator enabled. Click the toolbar
   icon again to inspect JSX elements.

## Privacy

The extension is limited to localhost development pages and communicates only with
the token-protected companion running at `127.0.0.1`. See the repository's
[`PRIVACY.md`](../../PRIVACY.md) for details.

## Release commands

```sh
npm install
npm run lint:firefox
npm run build:firefox
```

The signed archive is produced later by Mozilla Add-ons. The local unsigned build
is written to `dist/firefox/` for upload to AMO.
