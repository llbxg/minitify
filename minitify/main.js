const { app, BrowserWindow, ipcMain } = require('electron')

let win = null

function createWindow () {
    win = new BrowserWindow({
    // 🥬 window settings
        width: 150,
        height: 150,
        resizable:false,
        frame: false,
        backgroundColor:'#16181D',

        webPreferences: {
            worldSafeExecuteJavaScript: true,
            nodeIntegration: false,
            contextIsolation: true,
            preload: __dirname + '/preload.js'
        },
        'icon': 'build/icon.png',
    })

    win.loadFile('index.html')

    //win.webContents.openDevTools()

    win.once('ready-to-show', () => {
    win.show()
    })

    win.on('closed', () => {
        win = null
    })

    win.webContents.on('did-finish-load', () => {
        win.webContents.send("path", app.getPath('userData'));
    });
};

app.whenReady().then(() => {
    createWindow()
});

/*
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') { // 🥬 MAC - 完全消去ではなくなんか残るやつにできる。
        app.quit()
    }
});
*/

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});

ipcMain.on('plz-path', function(event,) {
    event.returnValue = app.getPath('userData');
});

ipcMain.on("close", () => {
    win.close()
});