const windowStateManager = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron');
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
        frame: false,
        autoHideMenuBar: true,
        minHeight: 600,
        minWidth: 500,
        maxHeight: 600,
        maxWidth: 500,
        webPreferences: {
            enableRemoteModule: false,
            contextIsolation: true,
            nodeIntegration: false,
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
        mainWindow.hide()
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
    if (dev) loadVite(port);
    else serveURL(mainWindow);
}

app.once('ready', createMainWindow);

let tray
app.whenReady().then(() => {
    console.log(appBin);
    tray = new Tray(appBin + 'tray@2x.png')
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show', click: function () {
                mainWindow.show()
                app.dock.show()
            }
        },
        {
            label: 'Hide', click: function () {
                mainWindow.hide()
                app.dock.hide()
            }
        },
        {
            label: 'Quit', click: function () {
                stopNode()
                app.quit()
            }
        },
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
    tray.setIgnoreDoubleClickEvents(true)
})

app.on('activate', () => {
    if (!mainWindow) {
        createMainWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        mainWindow.hide()
    }
});

ipcMain.on('hide', () => {
    app.dock.hide()
    mainWindow.hide()
})

ipcMain.on('min', () => {
    mainWindow.minimize()
})

ipcMain.on('to-main', (event, count) => {
    return mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
})

let kryptokrona
let running = false

ipcMain.on('startNode', () => {
    startNode()
})

ipcMain.on('stopNode', () => {
    stopNode()
})

ipcMain.on('restartNode', () => {
    restartNode()
})

const startNode = () => {
    if(running === false) {
        kryptokrona = spawn(appBin + 'kryptokrona --enable-cors=* --enable-blockexplorer --rpc-bind-ip=0.0.0.0 --rpc-bind-port=11898', {
            shell: true,
            detached: true
        })
    }
    console.log('Starting node')
    running = true
}

const stopNode = () => {
    console.log('Stopping node')
    if(running === true) {
        process.kill(-kryptokrona.pid, 'SIGINT')
        running = false
    }
}

const restartNode = () => {
    console.log('Restarting node');
    stopNode()
    setTimeout(() => {
        startNode()
    }, 15000)
}



