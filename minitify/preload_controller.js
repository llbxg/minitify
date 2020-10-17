const { contextBridge, ipcRenderer } = require("electron");

const { checkFromControllerToMain, getfromMainToController, addOrRemove } = require('./static/js/controller.js')


contextBridge.exposeInMainWorld(
    "spotify", {
        addOrRemove: addOrRemove,
    }
);

contextBridge.exposeInMainWorld(
    "api", {
        close: (where) => {
            ipcRenderer.send('close', where);
        },
        checkFromControllerToMain: checkFromControllerToMain,
        getfromMainToController: getfromMainToController,
     }
);