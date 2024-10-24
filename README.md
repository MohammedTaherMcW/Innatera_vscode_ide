
# innatera IDE
innatera IDE is a Vscode extension, Which provides the functionality of the [innatera Core ](https://github.com/MohammedTaherMcW/innatera_core/blob/master/README.rst) in Vscode.

## Installation Guide

### 1) Clone the Repository
#### Run the below command to clone the innatera Home Repository  
```
git clone https://github.com/MohammedTaherMcW/innatera_vscode_ide.git
```

### 2) Node.js Installation

#### Follow the Belows steps for Installation of Node.js
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

nvm install 20

```

### 3) Verify the Installation of Node.js
* Open a terminal or command prompt.
* Type `node -v` and press Enter.
* If Node.js is installed correctly, you should see the version number displayed.

Example:
```bash
$ npm -v
10.8.2
$ node -v
v20.17.0
```


### 4) Generate the Node Modules 
* Using npm package manager, Generate the Node Modules

```
npm i
```

## Execution
#### Inorder to run the extension in Development Host Window.  
```
press f5
```

#### Inorder to Pacakge the Extension:  
```
npm install -g @vscode/vsce

vsce package
```  
## Installation of VSIX
#### Once the .vsix package is generated,
* Click on the Extension tab in the vscode.  
* click on the three dots in the top of the extension section.    
* Select the **Install from vsix option** and select the vsix package.    
* Once the VSIX Package is installed, The extension will be displayed in the Extension Column. 


