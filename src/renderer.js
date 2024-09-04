import { Client } from '../LiteLoaderQQNT-Euphony/src/index.js';

const defaultConfig = {
    friends: []
};
const defaultAvatar = `appimg://${LiteLoader.plugins['daily_card'].path.plugin.replace(/\\/g, '/')}/src/assets/image/default_avatar.jpg`;

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

async function init() {
    const friends = new Map();
    const friendUins = [];
    for (const friend of Client.getFriends()) {
        friends.set(friend.getId(), {
            nick: friend.getNick(),
            remark: friend.getRemark()
        })
        friendUins.push(friend.getId());
    }
    daily_card.setFriends(friends);
    const config = await LiteLoader.api.config.get('daily_card', defaultConfig);
    config.friends = config.friends.filter(item => friendUins.includes(item));
    LiteLoader.api.config.set('daily_card', config);
}

async function drawCards() {
    const pskey = await Client.getPskey('ti.qq.com');
    if (pskey.error) {
        console.error(`[DailyCard] Failed to get pskey. Details: ${ pskey.error }`);
        return;
    }
    const times = Client.isSvip() ? 3 : 1;
    const config = await LiteLoader.api.config.get('daily_card', defaultConfig);
    for (const friend of config.friends) {
        const log = await daily_card.getLog();
        if (!(friend in log)) {
            log[friend] = [];
        }
        for (let i = log[friend].length; i < times; i ++) {
            const result = await Client.drawLuckyCard(friend, pskey);
            if (result.error) {
                log[friend].push(`第 ${ i + 1 } 次抽取失败。错误信息：${ result.error }`);
            } else {
                log[friend].push(`第 ${ i + 1 } 次抽取结果：${ result.word } （${ result.description }）`);
            }
            daily_card.setLog(log);
        }
    }
}

if (location.hash === "#/blank") {
    navigation.addEventListener("navigatesuccess", async () => {
        if (location.hash.startsWith('#/main')) {
            await euphonyNative.invokeNative('ns-ntApi', 'nodeIKernelBuddyService/getBuddyList', false, { force_update: true });
			await init();
			drawCards();
        }
    }, {
        once: true
    });
}

export const onSettingWindowCreated = async view => {

    view.insertAdjacentHTML('afterbegin', await (await fetch(`local:///${ LiteLoader.plugins['daily_card'].path.plugin }/src/ui/setting_page.html`)).text());
    const friendList = view.querySelector('#daily-card-list');
    const logDate = view.querySelector('#daily-card-log-date');
    const logList = view.querySelector('#daily-card-log-list');

    async function buildFriendItem(uin, nick, remark) {
        const friendItem = document.createElement('setting-item');

        const dailyCardFriend = document.createElement('div');
        dailyCardFriend.classList.add('daily-card-friend');

        const avatar = document.createElement('img');
        avatar.classList.add('daily-card-friend-avatar');
        avatar.onerror = () => {
            avatar.src = defaultAvatar;
        };
        avatar.src = `http://q1.qlogo.cn/g?b=qq&nk=${ uin }&s=100`;
        dailyCardFriend.appendChild(avatar);

        const textDiv = document.createElement('div');

        const nicknameText = document.createElement('setting-text');
        nicknameText.textContent = nick;
        textDiv.appendChild(nicknameText);

        const remarkText = document.createElement('setting-text');
        remarkText.textContent = remark;
        remarkText.dataset.type = 'secondary';
        textDiv.appendChild(remarkText);
        dailyCardFriend.appendChild(textDiv);

        friendItem.appendChild(dailyCardFriend);

        const toggleButton = document.createElement('setting-switch');
        toggleButton.toggleAttribute("is-active", (await LiteLoader.api.config.get('daily_card', defaultConfig)).friends.includes(uin));
        toggleButton.onclick = async () => {
            const config = await LiteLoader.api.config.get('daily_card', defaultConfig);
            const enabled = toggleButton.hasAttribute("is-active");
            toggleButton.toggleAttribute("is-active", !enabled);
            if (enabled) {
                config.friends = config.friends.filter(item => item != uin);
            } else {
                config.friends.push(uin);
            }
            LiteLoader.api.config.set('daily_card', config);
        };
        friendItem.appendChild(toggleButton);

        return friendItem;
    }

    function buildLogItem(uin, nick, remark, results) {
        const logItem = document.createElement('setting-item');

        const column = document.createElement('div');

        const dailyCardLog = document.createElement('div');
        dailyCardLog.classList.add('daily-card-log');

        const avatar = document.createElement('img');
        avatar.classList.add('daily-card-log-avatar');
        avatar.onerror = () => {
            avatar.src = defaultAvatar;
        };
        avatar.src = `http://q1.qlogo.cn/g?b=qq&nk=${ uin }&s=100`;
        dailyCardLog.appendChild(avatar);

        const textDiv = document.createElement('div');

        const nicknameText = document.createElement('setting-text');
        nicknameText.textContent = nick;
        textDiv.appendChild(nicknameText);

        const remarkText = document.createElement('setting-text');
        remarkText.textContent = remark;
        remarkText.dataset.type = 'secondary';
        textDiv.appendChild(remarkText);
        dailyCardLog.appendChild(textDiv);

        column.appendChild(dailyCardLog);

        const resultList = document.createElement('setting-list');
        resultList.classList.add('daily-card-log-result-list');
        resultList.dataset.direction = 'column';
        
        for (const result of results) {
            const resultItem = document.createElement('setting-item');
            resultItem.textContent = result;
            resultList.appendChild(resultItem);
        }

        column.appendChild(resultList);

        logItem.appendChild(column);

        return logItem;
    }

    async function loadLog(date) {
        const friends = await daily_card.getFriends();
        const logs = await daily_card.getLog(date);
        logList.innerHTML = '';
        for (const uin in logs) {
            logList.appendChild(buildLogItem(uin, (friends.get(uin)?.nick) ?? uin, (friends.get(uin)?.remark) ?? '', logs[uin]));
        }
    }

    const friends = await daily_card.getFriends();
    friends.forEach(async (value, key) => {
        friendList.appendChild(await buildFriendItem(key, value.nick, value.remark));
    });

    logDate.value = formatDate(new Date());
    logDate.oninput = () => loadLog(logDate.value);
    loadLog(logDate.value);
}