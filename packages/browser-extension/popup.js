// Firefox exposes the WebExtensions API as `browser`; Chrome compatibility is
// retained for local testing in Chromium-based browsers.
const api = globalThis.browser ?? globalThis.chrome;
const token = document.querySelector('#token');
const status = document.querySelector('#status');

async function startInspection(value) {
  if (!value) { status.textContent = 'Paste a browser token first.'; return; }
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  try {
    await api.tabs.sendMessage(tab.id, { type: 'jsx-open-in-code:enable', token: value });
    // Do not leave the popup covering the page the user is about to inspect.
    window.close();
  } catch {
    status.textContent = 'Reload this local dev page, then try again.';
  }
}

api.storage.local.get({ token: '', pairingError: '' }).then(({ token: savedToken, pairingError }) => {
  token.value = savedToken;
  if (pairingError) {
    status.textContent = pairingError;
    api.storage.local.remove('pairingError');
  }
});

document.querySelector('#save').addEventListener('click', async () => {
  const value = token.value.trim();
  if (!value) { status.textContent = 'Paste a browser token first.'; return; }
  await api.storage.local.set({ token: value });
  await api.storage.local.remove('pairingError');
  await startInspection(value);
});
