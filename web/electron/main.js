const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let backendProcess = null;

function backendCommand() {
  if (app.isPackaged) {
    const backendDir = path.join(process.resourcesPath, 'backend');
    const exePath = path.join(backendDir, 'auto-compta-backend.exe');
    return { command: exePath, args: [], cwd: backendDir };
  }

  return {
    command: 'python',
    args: [path.join('..', 'backend', 'desktop_launcher.py')],
    cwd: path.join(__dirname, '..'),
  };
}

function startBackend() {
  const { command, args, cwd } = backendCommand();
  const env = {
    ...process.env,
    APP_MODE: 'desktop',
    DB_ENGINE: 'sqlite',
    DEBUG: 'True',
    AUTO_COMPTA_DESKTOP_DATA_DIR: path.join(app.getPath('userData'), 'data'),
    AUTO_COMPTA_WEB_BUILD_DIR: path.join(process.resourcesPath, 'web', 'build'),
  };

  backendProcess = spawn(command, args, {
    cwd,
    env,
    stdio: 'ignore',
    windowsHide: true,
  });

  backendProcess.on('exit', code => {
    if (!app.isQuiting && code !== 0) {
      dialog.showErrorBox(
        'Auto Compta',
        "Le backend local s'est arrete. Verifiez la configuration Gemini ou reconstruisez l'application."
      );
    }
  });
}

async function waitForBackend(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        return;
      }
    } catch (error) {
      // Backend not ready yet.
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Backend startup timed out');
}

async function createWindow() {
  startBackend();
  await waitForBackend('http://127.0.0.1:8000/');

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: '#f7f2e8',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await mainWindow.loadURL('http://127.0.0.1:8000/');
}

app.whenReady().then(() => {
  createWindow().catch(error => {
    dialog.showErrorBox('Auto Compta', error.message);
    app.quit();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});
