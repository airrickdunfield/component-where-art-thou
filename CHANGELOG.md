# Changelog

All notable changes to JSX Open in Code are documented here.

## 0.1.1 — 2026-09-21

- Opening the browser toolbar popup now leaves the token field available instead
  of immediately reusing and closing over a saved token.
- An expired VS Code token is cleared after rejection and the popup explains how
  to pair again with a newly generated token.

## 0.1.0 — 2026-09-17

- Initial public release.
- Development-only Vite JSX source locator for `.jsx` and `.tsx` files.
- Firefox and Chromium inspectors with one-click inspect mode.
- Source-file/function breadcrumbs, DOM hover outline, and local VS Code opening.
- Token-protected localhost bridge with workspace-path validation.
