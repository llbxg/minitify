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
            preload: __dirname + '/preload_player.js'
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
        height: 65,
        resizable:false,
        frame: false,
        opacity: 1,
        backgroundColor:'#16181D',

        webPreferences: {
            worldSafeExecuteJavaScript: true,
            nodeIntegration: false,
            contextIsolation: true,
            preload: __dirname + '/preload_controller.js'
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

/* ---------- 🥬 basic ---------- */

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
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

ipcMain.on('makeChild', (event,height) => {
    if(childWin == null){
        createChildWindow(height);
    }
});



// 🥬 - 同期処理
ipcMain.on('plz-path', (event,) => {
    event.returnValue = app.getPath('userData');
});


/* ---------- 🥬 communication ---------- */

let [name, id, artists] = [null, null, null]

let myAccessTokenChange = false;

ipcMain.on("AccessTokenfromPlayerToMain", (event, b) => {
    myAccessTokenChange = b
});

ipcMain.on("fromPlayerToMain", (event, data) => {
    [name, id, artists] = data;
});

ipcMain.on('fromControllerToMain', (event, id_) => {
    let sendData = null;

    if (id_ != id){
        sendData = [name, id, artists]
    } else if (myAccessTokenChange) {
        sendData = [myAccessTokenChange]
        myAccessTokenChange = false;
    }

    if (sendData != null){
        event.sender.send('fromMainToController', sendData);
    }
});

