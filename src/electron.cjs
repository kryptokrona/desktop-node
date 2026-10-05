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

// 2026-10-05: skip Dock calls outside macOS.
let tray
app.whenReady().then(() => {
    console.log(appBin);
    tray = new Tray(appBin + 'tray@2x.png')
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show', click: function () {
                mainWindow.show()
                if (process.platform === 'darwin') app.dock.show()
            }
        },
        {
            label: 'Hide', click: function () {
                mainWindow.hide()
                if (process.platform === 'darwin') app.dock.hide()
            }
        },
        {
            label: 'Quit', click: function () {
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
    if (process.platform === 'darwin') app.dock.hide()
    mainWindow.hide()
})

ipcMain.on('min', () => {
    mainWindow.minimize()
})

ipcMain.on('to-main', (event, count) => {
    return mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
})

// 2026-10-05: acknowledge this tracked child's close before stop/restart completes.
let kryptokrona = null
let nodeCommand = 0
let quitRequested = false
let quitReady = false

ipcMain.on('startNode', () => {
    commandNode('start').catch(error => console.error('Could not start node', error))
})

ipcMain.handle('stopNode', () => commandNode('stop'))
ipcMain.handle('restartNode', () => commandNode('restart'))

app.on('before-quit', event => {
    if (quitReady) return
    event.preventDefault()
    if (quitRequested) return
    quitRequested = true
    ++nodeCommand
    stopNode().then(() => {
        quitReady = true
        app.quit()
    }).catch(error => {
        quitRequested = false
        console.error('Could not stop node before quitting', error)
    })
})

const startNode = () => {
    if (kryptokrona) return kryptokrona.ready

    const child = spawn(path.join(appBin, 'kryptokrona'), [
        '--enable-cors=*',
        '--enable-blockexplorer',
        '--rpc-bind-ip=0.0.0.0',
        '--rpc-bind-port=11898'
    ], {detached: true})
    const record = {child, didClose: false, stopping: null}
    record.closed = new Promise(resolve => {
        child.once('close', (code, signal) => {
            record.didClose = true
            if (kryptokrona === record) kryptokrona = null
            resolve({code, signal})
        })
    })
    record.ready = new Promise((resolve, reject) => {
        child.once('spawn', () => resolve())
        child.on('error', reject)
    })
    kryptokrona = record
    return record.ready
}

const stopNode = async () => {
    const record = kryptokrona
    if (!record) return
    if (record.stopping) return record.stopping

    const stopping = (async () => {
        try {
            await record.ready
        } catch (error) {
            // A failed spawn still has a child lifecycle to finish.
            await record.closed
            return
        }
        if (!record.didClose) {
            try {
                process.kill(-record.child.pid, 'SIGINT')
            } catch (error) {
                // ESRCH alone is not a close acknowledgement.
                if (error.code !== 'ESRCH') throw error
            }
        }
        await record.closed
    })()
    record.stopping = stopping
    try {
        await stopping
    } finally {
        if (record.stopping === stopping) record.stopping = null
    }
}

const commandNode = async action => {
    if (quitRequested) throw new Error('Application is quitting')
    const command = ++nodeCommand
    if (action !== 'start' || (kryptokrona && kryptokrona.stopping)) {
        await stopNode()
    }
    if (command !== nodeCommand || quitRequested) {
        throw new Error('Node command was superseded')
    }
    if (action === 'stop') return {status: 'closed'}
    await startNode()
    if (command !== nodeCommand || quitRequested) {
        throw new Error('Node command was superseded')
    }
    return {status: 'spawned'}
}
