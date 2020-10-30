const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require("fs");
const path = require('path');

const pathConfig = path.join(app.getPath('userData'), 'setting', 'config.json');

let alwaysOnTop = null;
if(checkFileExist(pathConfig)){
    let configData = fs.readFileSync(pathConfig, 'utf8');
    configData = JSON.parse(configData);
    alwaysOnTop = configData.alwaysOnTop;
} else {
    alwaysOnTop = false;
}

let win = null

function createWindow () {
    win = new BrowserWindow({
    // 🥬 window settings
        width: 150,
        height: 150,
        resizable:false,
        frame: false,
        backgroundColor:'#16181D',
        alwaysOnTop: alwaysOnTop,

        webPreferences: {
            worldSafeExecuteJavaScript: true,
            nodeIntegration: false,
            contextIsolation: true,
            preload: __dirname + '/preload_player.js'
        },
        'icon': 'build/icon.png',
    })

    win.loadFile('player.html')
    win.setMenu(null);

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

let controllerWin = null

function createControllerWindow (y) {
    const parentY = win.webContents.getOwnerBrowserWindow().getBounds().y
    const controllerY =  parentY + 300 > y ? parentY - 60 : parentY + 150

    controllerWin = new BrowserWindow({
        parent: win,
        x:win.webContents.getOwnerBrowserWindow().getBounds().x,
        y:controllerY,

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

    controllerWin.loadFile('controller.html')

    //ontrollerWin.webContents.openDevTools()

    controllerWin.once('ready-to-show', () => {
        controllerWin.show()
    })

    controllerWin.on('closed', () => {
        controllerWin = null
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
        if (controllerWin != null){
            controllerWin.close()
        }
    } else if (args == 'controller' ){
        controllerWin.close()
    }
});

ipcMain.on('makeController', (event,height) => {
    if(controllerWin == null){
        createControllerWindow(height);
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

/* ---------- 🥬 function ---------- */

function checkFileExist(filePath) {
    let isExist = false;
    try {
        fs.readFileSync(filePath);
        isExist = true;
    } catch(err) {
        isExist = false;
    }
    return isExist;
  }