const { contextBridge, ipcRenderer } = require("electron");

const { setJucket, playXpause, skipToNext, skipToPrevious } = require('./static/js/myspotifyapi.js')


contextBridge.exposeInMainWorld(
    "spotify", {
        setJucket: setJucket,
        playXpause: playXpause,
        skipToNext: skipToNext,
        skipToPrevious: skipToPrevious,
    }
  );

contextBridge.exposeInMainWorld(
    "api", {
        close: () => {
            ipcRenderer.send('close', "close");
        },
     }
);