import * as pioNodeHelpers from 'Innatera-node-helpers';
import { disposeSubscriptions, notifyError } from './utils';
import { getPIOProjectDirs, updateProjectItemState } from './project/helpers';
import { IS_OSX } from './constants';
import { extension } from './main';
import path from 'path';
import vscode from 'vscode';


export default class PIOCustom {
  static defaultStartUrl = '/';

  constructor() {
    this.subscriptions = [];
    this._currentPanel = undefined;
    this._lastStartUrl = PIOCustom.defaultStartUrl;

    this.subscriptions.push(
      vscode.workspace.onDidChangeWorkspaceFolders(this.disposePanel.bind(this)),
    );
  }

  async toggle(startUrl = PIOCustom.defaultStartUrl) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    try {
      if (this._currentPanel) {
        if (this._lastStartUrl !== startUrl) {
          this._currentPanel.webview.html = await this.getWebviewContent();
        }
        return this._currentPanel.reveal(column);
      }
    } catch (err) {
      console.warn(err);
    }

    this._currentPanel = await this.newPanel(startUrl);
  }

  async newPanel(startUrl) {
    const panel = vscode.window.createWebviewPanel(
      'pioHome',
      extension.getEnterpriseSetting('pioHomeTitle', 'Custom Targets'),
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );

    this.subscriptions.push(panel.onDidDispose(this.onPanelDisposed.bind(this)));

    panel.iconPath = vscode.ThemeIcon.File;

    panel.webview.html = this.getLoadingContent();

    try {
      panel.webview.html = await this.getWebviewContent();
    } catch (err) {
      if (!err.toString().includes('Webview is disposed')) {
        notifyError('Start PIO Home Server', err);
      }
    }
     panel.webview.onDidReceiveMessage(
       message => {
          switch (message.command) {
            case 'RetrieveTargets':
              vscode.window.showInformationMessage(message.text);
              return;
          }
        },
        undefined,
        this.subscriptions
      );

    return panel;
  }

  disposePanel() {
    disposeSubscrictions(this.subscriptions);
  }

  onPanelDisposed() {
    this._currentPanel = undefined;
  }

  dispose() {
    pioNodeHelpers.home.shutdownServer();
    this.disposePanel();
    disposeSubscriptions(this.subscriptions);
  }

  getLoadingContent() {
    const theme = "light";
    console.log("Theme is ", theme);
    return `<!DOCTYPE html>
    <html lang="en">
    <body style="background-color: ${theme === 'light' ? '#FFF' : '#1E1E1E'}">
      <div style="padding: 15px;">Loading...</div>
    </body>
    </html>`;
  }

  getTheme() {
    const workbench = vscode.workspace.getConfiguration('workbench') || {};
    return (workbench.colorTheme || '').toLowerCase().includes('light')
      ? 'light'
      : 'dark';
  }

  async getWebviewContent() {
    const theme = "dark";
    console.log(theme);
    return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Targets</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      margin-top: 100px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    form {
      display: inline-block;
      margin-bottom: 20px;
    }
    input[type="text"] {
      padding: 5px;
      width: 300px;
      font-size: 16px;
    }
    input[type="submit"] {
      padding: 5px 10px;
      font-size: 16px;
    }
    .label {
      float: left;
      margin-right: 10px;
    }
    
  </style>
</head>

<body>
  <h1>Custom Targets</h1>
  <form id="myForm">
    <label for="myInput" class="label">Enter Targets:</label>
    <input type="text" id="myInput" name="myInput">
  </form>
  <br>
  <input type="button" value="Submit" id="submitButton">
  <script>
    const vscode = acquireVsCodeApi();
    document.getElementById('submitButton').addEventListener('click', function (event) {
      event.preventDefault();
      let value = document.getElementById('myInput').value;
      console.log(value);
      vscode.postMessage({
        command: 'RetrieveTargets',
        'text': value
      });
    });
    document.getElementById('submitButton').style.display = 'block';
    document.getElementById('submitButton').style.margin = '0 auto';
  </script>
</body>

</html>

`;
  }
}


