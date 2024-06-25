const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let friends = [];

function formatDate(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) {
        month = `0${month}`;
    }
    if (day < 10) {
        day = `0${day}`;
    }
    return `${year}-${month}-${day}`;
}

ipcMain.handle('LiteLoader.daily_card.setFriends', (event, newFriends) => {
    friends = newFriends;
});

ipcMain.handle('LiteLoader.daily_card.getFriends', () => {
    return friends;
});

ipcMain.handle('LiteLoader.daily_card.setLog', (event, log, date) => {
    if (!date) {
        date = formatDate(new Date());
    }
    const logPath = path.join(LiteLoader.plugins['daily_card'].path.data, 'logs', `${ date }.json`);
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.writeFileSync(logPath, JSON.stringify(log, null, 4), 'utf-8');
});

ipcMain.handle('LiteLoader.daily_card.getLog', (event, date) => {
    if (!date) {
        date = formatDate(new Date());
    }
    const logPath = path.join(LiteLoader.plugins['daily_card'].path.data, 'logs', `${ date }.json`);
    if (fs.existsSync(logPath)) {
        return JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    } else {
        return {};
    }
});