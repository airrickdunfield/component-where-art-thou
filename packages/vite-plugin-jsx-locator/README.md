# @airrickdunfield/vite-plugin-jsx-locator

Development-only JSX source metadata for JSX Open in Code.

The plugin annotates native JSX elements with their source file, line, column, and
component ownership while Vite serves a React app. The companion browser extension
uses that metadata to open the selected source location in VS Code.

## Install

```sh
npm install -D @airrickdunfield/vite-plugin-jsx-locator
```

## Optional local activation

Use a dynamic import so teammates who do not use JSX Open in Code do not need the
plugin installed. Add this to `.env.local`:

```txt
JSX_OPEN_IN_CODE=true
```

Then configure Vite:

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

The plugin only transforms `.jsx` and `.tsx` files during `vite serve` and has no
effect on production builds.

## License

MIT
