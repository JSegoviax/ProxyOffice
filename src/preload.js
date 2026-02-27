const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the web game context
contextBridge.exposeInMainWorld('electronAPI', {
    // Example: Load scene data
    // readSceneData: (sceneName) => ipcRenderer.invoke('read-scene-data', sceneName)
});
