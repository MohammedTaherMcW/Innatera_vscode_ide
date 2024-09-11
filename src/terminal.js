/**
 * Copyright (c)2024-present Innatera <contact@innatera.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import vscode from 'vscode';

export default class PIOTerminal {
  constructor() {
    this._instance = undefined;
  }

  new() {
    const envClone = Object.assign({}, process.env);
    if (process.env.PLATFORMIO_PATH) {
      envClone.PATH = process.env.PLATFORMIO_PATH;
      envClone.Path = process.env.PLATFORMIO_PATH;
    }
    return vscode.window.createTerminal({
      name: 'Innatera CLI',
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
