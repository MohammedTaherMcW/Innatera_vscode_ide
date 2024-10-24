

import vscode from 'vscode';

export default class PIOTerminal {
  constructor() {
    this._instance = undefined;
  }

  new() {
    const envClone = Object.assign({}, process.env);
    if (process.env.Innatera_PATH) {
      envClone.PATH = process.env.Innatera_PATH;
      envClone.Path = process.env.Innatera_PATH;
    }
    return vscode.window.createTerminal({
      name: 'innatera CLI',
      env: envClone,
    });
  }

  sendText(text) {
    if (!this._instance || this._instance.exitStatus !== undefined) {
      this._instance = this.new();
    }
    this._instance.sendText(text);
    this._instance.show();
  }

  dispose() {
    if (this._instance) {
      this._instance.dispose();
    }
    this._instance = undefined;
  }
}
