const vscode = require('vscode');
const http = require('http');
const crypto = require('crypto');
const path = require('path');
const { execFile } = require('child_process');

const PORT = 48732;
const TOKEN_KEY = 'browserToken';

function withinWorkspace(file) {
  const normalized = path.resolve(file);
  return vscode.workspace.workspaceFolders?.some(({ uri }) => {
    const root = path.resolve(uri.fsPath);
    return normalized === root || normalized.startsWith(`${root}${path.sep}`);
  }) ?? false;
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => { raw += chunk; if (raw.length > 10_000) reject(new Error('Request is too large.')); });
    request.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Invalid JSON.')); } });
    request.on('error', reject);
  });
}

function reply(response, status, message) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  response.end(JSON.stringify({ message }));
}

function bringVsCodeToFront() {
  // VS Code's extension API selects an editor but deliberately does not steal
  // macOS application focus. `open -a` activates the existing VS Code app while
  // leaving the already-selected editor intact. Other platforms need no extra
  // handling for this first macOS-focused MVP.
  if (process.platform === 'darwin') {
    execFile('open', ['-a', 'Visual Studio Code'], () => {});
  }
}

async function activate(context) {
  let token = context.globalState.get(TOKEN_KEY);
  const output = vscode.window.createOutputChannel('JSX Open in Code');
  context.subscriptions.push(output);

  async function generateToken() {
    token = crypto.randomBytes(24).toString('base64url');
    await context.globalState.update(TOKEN_KEY, token);
    await vscode.env.clipboard.writeText(token);
    vscode.window.showInformationMessage('JSX Open in Code token copied to your clipboard. Paste it into the browser extension.');
  }
  context.subscriptions.push(vscode.commands.registerCommand('jsxOpenInCode.generateBrowserToken', generateToken));

  const server = http.createServer(async (request, response) => {
    if (request.method === 'OPTIONS') { response.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, X-JSX-Open-In-Code-Token' }); response.end(); return; }
    if (request.method !== 'POST' || request.url !== '/open') return reply(response, 404, 'Not found');
    if (!token || request.headers['x-jsx-open-in-code-token'] !== token) return reply(response, 401, 'Invalid browser token');
    try {
      const { file, line, column } = await readJson(request);
      if (typeof file !== 'string' || !Number.isInteger(line) || !withinWorkspace(file)) return reply(response, 400, 'The requested location is invalid or outside the open workspace.');
      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(file));
      const position = new vscode.Position(Math.max(0, line - 1), Math.max(0, (column || 1) - 1));
      const editor = await vscode.window.showTextDocument(document, { preview: true });
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
      bringVsCodeToFront();
      reply(response, 200, 'Opened');
    } catch (error) { output.appendLine(`Open failed: ${error.message}`); reply(response, 500, 'VS Code could not open this location.'); }
  });
  server.listen(PORT, '127.0.0.1', () => output.appendLine(`Listening at http://127.0.0.1:${PORT}`));
  server.on('error', (error) => vscode.window.showErrorMessage(`JSX Open in Code server failed: ${error.message}`));
  context.subscriptions.push({ dispose: () => server.close() });
}

function deactivate() {}
module.exports = { activate, deactivate };
