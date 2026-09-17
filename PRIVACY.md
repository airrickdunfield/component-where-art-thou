# Privacy policy

Last updated: September 17, 2026

JSX Open in Code is designed to work locally during development.

## Data handling

- The browser extension runs only on `localhost` and `127.0.0.1` development
  pages.
- When you explicitly activate inspection and click an element, the extension
  reads development-only JSX source metadata from that page.
- It sends the selected local file path, line, and column only to the JSX Open
  in Code VS Code companion extension at `http://127.0.0.1:48732`.
- The VS Code companion accepts requests only with a locally generated token and
  only opens files inside an open VS Code workspace.

Firefox identifies this local source-metadata transfer as `websiteContent` in its
extension data-consent declaration. It is required solely to pass the selected
location to the on-device VS Code companion; it is not sent to a remote service.

## No remote collection

JSX Open in Code does not send source code, file paths, browser activity,
analytics, or personal information to a remote server. It does not use telemetry,
advertising, or tracking.

## Contact

For questions or reports, open an issue in this project's GitHub repository.
