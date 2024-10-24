

import { disposeSubscriptions } from './utils';
import { extension } from './main';
import { promises as fs } from 'fs';
import path from 'path';
import vscode from 'vscode';

export default class PIOReleaseNotes {
  constructor() {
    this.version = extension.context.extension.packageJSON.version;
    this._currentPanel = undefined;

    this.subscriptions = [
      vscode.commands.registerCommand('Innatera-snp-ide.showReleaseNotes', () =>
        this.toggle(),
      ),
    ];

    const stateKey = 'showedReleaseNotesFor';
    if (extension.context.globalState.get(stateKey) !== this.version) {
      extension.context.globalState.update(stateKey, this.version);
      this.toggle();
    }
  }

  dispose() {
    disposeSubscriptions(this.subscriptions);
  }

  async toggle() {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;
    try {
      if (this._currentPanel) {
        this._currentPanel.webview.html = await this.getWebviewContent();
        return this._currentPanel.reveal(column);
      }
    } catch (err) {
      console.warn(err);
    }
    this._currentPanel = await this.newPanel();
  }

  async newPanel() {
    const panel = vscode.window.createWebviewPanel(
      'pioReleaseNotes',
      'innatera IDE: Release Notes',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );
    panel.iconPath = vscode.Uri.file(
      path.join(
        extension.context.extensionPath,
        'assets',
        'images',
        'platformio-mini-logo.svg',
      ),
    );
    panel.onDidDispose(
      () => (this._currentPanel = undefined),
      undefined,
      this.subscriptions,
    );
    const logoSrc = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(
          extension.context.extensionPath,
          'assets',
          'images',
          'platformio-logo.png',
        ),
      ),
    );
    panel.webview.html = await this.getWebviewContent(logoSrc);
    return panel;
  }

  async getWebviewContent(logoSrc) {
    const releaseNotes = await this.readReleaseNotes();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>innatera IDE: Release Notes</title>
  <style>ul { padding-top: 5px; } li { padding-bottom: 4px; }</style>
</head>
<body>
  <table border="0">
  <tr>
    <td><img src="${logoSrc}" width="28px" height="28px"></td>
    <td style="padding-left: 10px"><h1>innatera IDE Release Notes</h1></td>
  </tr>
  </table>
  <div>
    Welcome to the ${this.version} release of innatera IDE.
    There are many updates in this version that we hope you'll like.
  </div>
  <p>
    <b>Release History</b>: Want to read about us 
    Please visit <a href="https://innatera.com/">Innatera</a>
    for more detailed information.
  </p>
  <p id="content">Loading...</p>
  <h2>Stay in touch with us</h2>
  <p>
    Please follow us on <a href="https://www.linkedin.com/company/innatera/?originalSubdomain=nl">LinkedIn</a> 
    to keep up to date with the latest news, articles and tips!
  </p>
  <textarea id="pioRNMarkdown" hidden="hidden">${releaseNotes}</textarea>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script>
    document.getElementById('content').innerHTML =
      marked.parse(document.getElementById('pioRNMarkdown').value);
  </script>
</body>
</html>`;
  }

  async readReleaseNotes() {
    const changelogPath = path.join(extension.context.extensionPath, 'CHANGELOG.md');
    try {
      const contents = await fs.readFile(changelogPath, { encoding: 'utf-8' });
      const startsAt = contents.indexOf('\n## ');
      return contents.substring(startsAt, contents.indexOf('\n## ', startsAt + 3));
    } catch (err) {
      return err.toString();
    }
  }
}
