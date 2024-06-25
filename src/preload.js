const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('daily_card', {
    setFriends: friends => ipcRenderer.invoke(
        'LiteLoader.daily_card.setFriends',
        friends
    ),
    getFriends: () => ipcRenderer.invoke(
        'LiteLoader.daily_card.getFriends'
    ),
    setLog: (log, date) => ipcRenderer.invoke(
        'LiteLoader.daily_card.setLog',
        log,
        date
    ),
    getLog: date => ipcRenderer.invoke(
        'LiteLoader.daily_card.getLog',
        date
    )
});
