

import * as vscode from 'vscode';

class QuickItem extends vscode.TreeItem {
  constructor(label, command, args, collapsibleState, children) {
    super(label, collapsibleState);
    if (command) {
      this.command = {
        title: label,
        command,
        arguments: args,
      };
    }
    this.customChildren = children;
  }
}

export default class QuickAccessTreeProvider {
  getChildren(element) {
    if (element && element.customChildren) {
      return element.customChildren;
    }
    return [
      new QuickItem(
        'Innatera Home',
        undefined,
        undefined,
        vscode.TreeItemCollapsibleState.Expanded,
        [
          new QuickItem('Open', 'Innatera-snp-ide.showHome'),
          // new QuickItem('Innatera Account', 'Innatera-snp-ide.showHome', ['/account']),
          new QuickItem('Inspect', 'Innatera-snp-ide.showHome', ['/inspect']),
          new QuickItem('Projects & Configuration', 'Innatera-snp-ide.showHome', [
            '/projects',
          ]),
          new QuickItem('Boards', 'Innatera-snp-ide.showHome', ['/boards']),
          new QuickItem('Platforms', 'Innatera-snp-ide.showHome', ['/platforms']),
          new QuickItem('Devices', 'Innatera-snp-ide.showHome', ['/device']),
        ],
      ),
      new QuickItem(
        'Debug',
        undefined,
        undefined,
        vscode.TreeItemCollapsibleState.Expanded,
        [
          new QuickItem('Start Debugging', 'Innatera-snp-ide.startDebugging'),
          new QuickItem('Toggle Debug Console', 'workbench.debug.action.toggleRepl'),
        ],
      ),
      new QuickItem(
        'Miscellaneous',
        undefined,
        undefined,
        vscode.TreeItemCollapsibleState.Expanded,
        [
          // new QuickItem(
          //   'Serial & UDP Plotter',
          //   'workbench.extensions.action.showExtensionsWithIds',
          //   [['alexnesnes.teleplot']],
          // ),
          new QuickItem('Innatera Core CLI', 'Innatera-snp-ide.openPIOCoreCLI'),
          new QuickItem('Clone Git Project', 'git.clone'),
          new QuickItem('New Terminal', 'Innatera-snp-ide.newTerminal'),
          new QuickItem('Upgrade Innatera Core', 'Innatera-snp-ide.upgradeCore'),
          new QuickItem('Show Release Notes', 'Innatera-snp-ide.showReleaseNotes'),
        ],
      ),
    ];
  }

  getTreeItem(element) {
    return element;
  }
}
