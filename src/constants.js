export const IS_WINDOWS = process.platform.startsWith('win');
export const IS_OSX = process.platform == 'darwin';
export const IS_LINUX = !IS_WINDOWS && !IS_OSX;
export const PIO_CORE_VERSION_SPEC = '>=1.0.0';
export const STATUS_BAR_PRIORITY_START = 10;
export const CONFLICTED_EXTENSION_IDS = [
  'llvm-vs-code-extensions.vscode-clangd',
  'vsciot-vscode.vscode-arduino',
  'vscode-openapi',
];
