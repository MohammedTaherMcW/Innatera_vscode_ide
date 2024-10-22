

import fs from 'fs-plus';
import vscode from 'vscode';

export default class PythonPrompt {
  STATUS_TRY_AGAIN = 0;
  STATUS_ABORT = 1;
  STATUS_CUSTOMEXE = 2;

  async prompt() {
    const selectedItem = await vscode.window.showInformationMessage(
      'innatera: Can not find working Python 3.6+ Interpreter. Please install the latest Python 3 and restart VSCode',
      { title: 'Install Python', isCloseAffordance: false },
      { title: 'I have Python', isCloseAffordance: false },
      { title: 'Try again', isCloseAffordance: false },
      { title: 'Abort innatera IDE Installation', isCloseAffordance: true },
    );

    let result = { status: this.STATUS_TRY_AGAIN };
    let pythonExecutable = undefined;
    switch (selectedItem ? selectedItem.title : undefined) {
      case 'Install Python':
        vscode.commands.executeCommand(
          'vscode.open',
          vscode.Uri.parse(
            'https://docs.platformio.org/en/latest/faq/install-python.html',
          ),
        );
        break;
      case 'I have Python':
        pythonExecutable = await vscode.window.showInputBox({
          prompt: 'Please specify a full path to Python executable file',
          placeHolder: 'Full path to python/python.exe',
          validateInput: (value) =>
            !fs.isFileSync(value) ? 'Invalid path to Python Interpreter' : null,
        });
        if (pythonExecutable) {
          result = {
            status: this.STATUS_CUSTOMEXE,
            pythonExecutable,
          };
        }
        break;
      case 'Abort innatera IDE Installation':
        result = { status: this.STATUS_ABORT };
        break;
    }

    return result;
  }
}
