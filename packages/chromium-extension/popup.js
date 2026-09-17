const api = globalThis.browser ?? globalThis.chrome;
const token = document.querySelector('#token');
const status = document.querySelector('#status');

async function startInspection(value) {
  if (!value) { status.textContent = 'Paste a browser token first.'; return; }
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  try {
    await api.tabs.sendMessage(tab.id, { type: 'jsx-open-in-code:enable', token: value });
    window.close();
  } catch {
    status.textContent = 'Reload this local dev page, then try again.';
  }
}

api.storage.local.get({ token: '' }).then(({ token: savedToken }) => {
  token.value = savedToken;
  if (savedToken) startInspection(savedToken);
});

document.querySelector('#save').addEventListener('click', async () => {
  const value = token.value.trim();
  if (!value) { status.textContent = 'Paste a browser token first.'; return; }
  await api.storage.local.set({ token: value });
  await startInspection(value);
});
