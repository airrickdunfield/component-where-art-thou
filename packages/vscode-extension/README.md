# JSX Open in Code

Open the JSX source behind a rendered element directly from your browser.

This extension is the local VS Code companion for JSX Open in Code. It receives a
user-selected location from the Firefox or Chromium browser extension and opens the
matching file and line inside your current workspace.

## Setup

1. Install this extension from the VS Code Marketplace.
2. Open your Vite React project folder in VS Code.
3. Run **JSX Open in Code: Generate Browser Token** from the Command Palette.
4. Paste the token into the JSX Open in Code browser extension once.
5. Enable the optional Vite JSX locator in your project, start Vite, and inspect a
   local element in your browser.

## Security and privacy

The extension listens only on `127.0.0.1:48732`. It requires a locally generated
browser token and refuses requests for files outside an open VS Code workspace.
It does not send code, paths, or telemetry to a remote service.

## Requirements

- The JSX Open in Code Firefox or Chromium browser extension.
- `@airrickdunfield/vite-plugin-jsx-locator` installed in the Vite React project.
- A local Vite development server.

## License

MIT
