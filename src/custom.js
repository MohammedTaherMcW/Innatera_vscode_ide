import * as pioNodeHelpers from 'Innatera-node-helpers';
import { disposeSubscriptions, notifyError } from './utils';
import { IS_OSX, IS_WINDOWS} from './constants';
import { extension } from './main';
import path from 'path';
import vscode from 'vscode';

export default class PIOCustom {
  static defaultStartUrl = '/';
  vscode = require('vscode');
  panel = undefined;

  constructor() {
    this.subscriptions = [];
    this._currentPanel = undefined;
    this._lastStartUrl = PIOCustom.defaultStartUrl;

    this.subscriptions.push(
      vscode.workspace.onDidChangeWorkspaceFolders(
        this.disposePanel.bind(this),
      ),
    );
  }

  async toggle(startUrl = PIOCustom.defaultStartUrl) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    try {
      if (this._currentPanel) {
        if (this._lastStartUrl !== startUrl) {
          this._currentPanel.webview.html = await this.getWebviewContent(
            startUrl,
          );
        }

        return this._currentPanel.reveal(column);
      }
    } catch (err) {
      console.warn(err);
    }

    this._currentPanel = await this.newPanel(startUrl);
  }

  static async shutdownAllServers() {
    await pioNodeHelpers.custom.shutdownServer();
    await pioNodeHelpers.custom.shutdownAllServers();
  }

  disposePanel() {
    if (!this._currentPanel) {
      return;
    }

    this._currentPanel.dispose();
    this._currentPanel = undefined;
  }

  onPanelDisposed() {
    this._currentPanel = undefined;
  }

  dispose() {
    pioNodeHelpers.custom.shutdownServer();
    this.disposePanel();
    disposeSubscriptions(this.subscriptions);
  }

  async newPanel(startUrl) {
    const panel = vscode.window.createWebviewPanel(
      'pioHome',
      extension.getEnterpriseSetting('pioHomeTitle', 'innatera Custom'),
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );

    this.subscriptions.push(
      panel.onDidDispose(this.onPanelDisposed.bind(this)),
    );

    panel.iconPath = vscode.Uri.file(
      path.join(
        extension.context.extensionPath,
        'assets',
        'images',
        'platformio-mini-logo.svg',
      ),
    );
    this.panel =  panel;
    panel.webview.html = this.getLoadingContent();

    try {
      panel.webview.html = await this.getWebviewContent(startUrl);
    } catch (err) {
      if (!err.toString().includes('Webview is disposed')) {
        notifyError('Start PIO Home Server', err);
      }
    }


    return panel;
  }

  getLoadingContent() {
    const theme = this.getTheme();
    return `<!DOCTYPE html>
    <html lang="en">
    <body style="background-color: ${
      theme === 'light' ? '#FFF' : '#1E1E1E'
    }">
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

  async getWebviewContent(startUrl) {
    this._lastStartUrl = startUrl;
    await pioNodeHelpers.custom.ensureServerStarted({
      port: extension.getConfiguration('innateraCustomServerHttpPort'),
      host: extension.getConfiguration('innateraCustomServerHttpHost'),
      onIDECommand: await this.onIDECommand.bind(this),
    });
    const theme = this.getTheme();
    const iframeId = `pioHomeIFrame-${vscode.env.sessionId}`;
    const iframeScript = `
      <script>
        function execCommand(data) {
          document.getElementById('${iframeId}').contentWindow.postMessage({'command': 'execCommand', 'data': data}, '*');
        }

        for (const command of ['copy', 'paste', 'cut']) {
          document.addEventListener(command, (e) => {
            execCommand(command);
          });
        }

        document.addEventListener('selectstart', (e) => {
          execCommand('selectAll');
          e.preventDefault();
        });

        window.addEventListener('keydown', (e) => {
          if (e.key === 'z' && e.metaKey) {
            execCommand(e.shiftKey ? 'redo' : 'undo');
          }
        });

        window.addEventListener('message', (e) => {
          if (e.data.command === 'kbd-event') {
            window.dispatchEvent(new KeyboardEvent('keydown', e.data.data));
          }
        });
      </script>
    `;

    return `<!DOCTYPE html>
      <html lang="en">
      <head>${IS_OSX ? iframeScript : ''}</head>
      <body style="margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: ${
        theme === 'light' ? '#FFF' : '#1E1E1E'
      }">
        <iframe id="${iframeId}" src="${pioNodeHelpers.custom.getFrontendUrl({
          start: startUrl,
          theme,
          workspace: extension.getEnterpriseSetting('defaultPIOHomeWorkspace'),
        })}"
          width="100%"
          height="100%"
          frameborder="0"
          style="border: 0; left: 0; right: 0; bottom: 0; top: 0; position:absolute;" />
      </body>
      </html>
    `;
  }

  async onIDECommand(command, params) {
    switch (command) {
      case 'get_custom_targets':
        return this.onGetCustomTargets(params);
    }
  }
async runTask(targets) {
    try {
        for (let target of targets) { 
            target = target.trim();
            const platformioPath = IS_WINDOWS 
                ? path.join(process.env.USERPROFILE, '.innatera', 'penv', 'Scripts', 'innaterapluginio.exe')
                : path.join(process.env.HOME, '.innatera', 'penv', 'bin', 'innaterapluginio');

            const execution = new vscode.ProcessExecution(
                platformioPath,
                ['run', '--target', target],
            );

            const task = new vscode.Task(
                { type: 'innatera', target },
                vscode.TaskScope.Workspace,
                `Run PIO Target: ${target}`,
                'Custom Tasks',
                execution
            );

            const taskExecution = await vscode.tasks.executeTask(task);

            await new Promise((resolve, reject) => {
                const disposableEnd = vscode.tasks.onDidEndTaskProcess(event => {
                    if (event.execution === taskExecution) {
                        console.info(`Task ended with exit code: ${event.exitCode}`);
                        disposableEnd.dispose();
                        disposableStart.dispose();
                        if (event.exitCode === 0) {
                            resolve();
                        } else {
                            reject(new Error(`Task ${task.name} failed with exit code ${event.exitCode}`));
                        }
                    }
                });

                const disposableStart = vscode.tasks.onDidStartTaskProcess(event => {
                    if (event.execution === taskExecution) {
                        console.info(`Task started: ${event.execution.task.name}`);
                    }
                });
            });
        }

    } catch (error) {
        console.error('Error executing tasks:', error.message);
    }
}
  async onGetCustomTargets(targets) {
    const splitTargets  = targets.split(',');
    this.runTask(splitTargets); 
  }

}