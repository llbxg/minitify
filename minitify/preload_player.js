const { contextBridge, ipcRenderer } = require("electron");

const { setJucket, playXpause, skipToNext, skipToPrevious, skipToBack} = require('./static/js/player.js')


contextBridge.exposeInMainWorld(
    "spotify", {
        setJucket: setJucket,
        playXpause: playXpause,
        skipToNext: skipToNext,
        skipToPrevious: skipToPrevious,
        skipToBack: skipToBack,
    }
);

contextBridge.exposeInMainWorld(
    "api", {
        close: (where) => {
            ipcRenderer.send('close', where);
        },
        makeChild: (height) => {
            ipcRenderer.send('makeChild', height);
        }
     }
);