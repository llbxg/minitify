const { contextBridge, ipcRenderer } = require("electron");

const { setJucket, playXpause, skipToNext, skipToPrevious, skipToBack, checkFromControllerToMain, getfromMainToController } = require('./static/js/myspotifyapi.js')


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
        checkFromControllerToMain: checkFromControllerToMain,
        getfromMainToController: getfromMainToController,
        makeChild: (height) => {
            ipcRenderer.send('makeChild', height);
        }
     }
);