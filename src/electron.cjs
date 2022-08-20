const windowStateManager = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const {app, BrowserWindow, ipcMain} = require('electron');
const serve = require('electron-serve');
const path = require('path');
const spawn = require('child_process').spawn;

const appRoot = require('app-root-dir').get().replace('app.asar', '');
const appBin = appRoot + '/bin/';

try {
    require('electron-reloader')(module);
} catch (e) {
    console.error(e);
}

const serveURL = serve({directory: "."});
const port = process.env.PORT || 3000;
const dev = !app.isPackaged;
let mainWindow;

function createWindow() {
    let windowState = windowStateManager({
        defaultWidth: 500,
        defaultHeight: 600,
    });

    const mainWindow = new BrowserWindow({
        backgroundColor: '#121212',
        titleBarStyle: 'hidden',
        autoHideMenuBar: true,
        trafficLightPosition: {
            x: 15,
            y: 10,
        },
        minHeight: 600,
        minWidth: 500,
        maxHeight: 600,
        maxWidth: 500,
        webPreferences: {
            enableRemoteModule: true,
            contextIsolation: true,
            nodeIntegration: true,
            spellcheck: false,
            devTools: dev,
            preload: path.join(__dirname, "preload.cjs")
        },
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
    });

    windowState.manage(mainWindow);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('close', () => {
        windowState.saveState(mainWindow);
        stopNode()
    });

    return mainWindow;
}

contextMenu({
    showLookUpSelection: false,
    showSearchWithGoogle: false,
    showCopyImage: false,
    prepend: (defaultActions, params, browserWindow) => [
        {
            label: 'Make App 💻',
        },
    ],
});

function loadVite(port) {
    mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
        console.log('Error loading URL, retrying', e);
        setTimeout(() => {
            loadVite(port);
        }, 200);
    });
}

function createMainWindow() {
    mainWindow = createWindow();
    mainWindow.once('close', () => {
        mainWindow = null
    });

    if (dev) loadVite(port);
    else serveURL(mainWindow);
}

app.once('ready', createMainWindow);
app.on('activate', () => {
    if (!mainWindow) {
        createMainWindow();
    }
    console.log('me')
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
    stopNode()
});

ipcMain.on('to-main', (event, count) => {
    return mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
})

let kryptokrona
let running = false
ipcMain.on('startNode', () => {
    if(running === false) {
        kryptokrona = spawn(appBin + 'kryptokrona --enable-cors=* --enable-blockexplorer --rpc-bind-ip=0.0.0.0 --rpc-bind-port=11898', {
            shell: true,
            detached: true
        })
    }
    console.log('Starting kryptokrona')
    running = true
})

ipcMain.on('stopNode', () => {
    stopNode()
})

const stopNode = () => {
    console.log('Stopping kryptokrona')
    if(running === true) {
        process.kill(-kryptokrona.pid)
        running = false
    }
}



