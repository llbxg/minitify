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

let childWin = null

function createChildWindow (y) {
    const parentY = win.webContents.getOwnerBrowserWindow().getBounds().y
    const childY =  parentY + 300 > y ? parentY - 60 : parentY + 150

    childWin = new BrowserWindow({
        parent: win,
        x:win.webContents.getOwnerBrowserWindow().getBounds().x,
        y:childY,

        width: 150,
        height: 60,
        resizable:false,
        frame: false,
        opacity: 0.3,
        backgroundColor:'#16181D',

        webPreferences: {
            worldSafeExecuteJavaScript: true,
            nodeIntegration: false,
            contextIsolation: true,
            preload: __dirname + '/preload.js'
        },
    })

    childWin.loadFile('controller.html')

    //childWin.webContents.openDevTools()

    childWin.once('ready-to-show', () => {
        childWin.show()
    })

    childWin.on('closed', () => {
        childWin = null
    })
}

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

ipcMain.on('plz-path', (event,) => {
    event.returnValue = app.getPath('userData');
});

ipcMain.on('makeChild', (event,height) => {
    if(childWin == null){
        createChildWindow(height);
    }
});

let name = null
ipcMain.on("setName", (event, args) => {
    name = args;
});

ipcMain.on('getName', (event,args) => {
    if (args != name){
        event.sender.send('replyName', name);
    }
});

// 🥬 - close処理
ipcMain.on("close", (event, args) => {
    if (args=='main'){
        win.close()
        if (childWin != null){
            childWin.close()
        }
    } else if (args == 'controller' ){
        childWin.close()
    }
});