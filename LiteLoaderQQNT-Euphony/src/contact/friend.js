import { Cache, Contact } from '../index.js';

/**
 * `Friend` 类型代表好友。
 * 
 * @property { String } #uid 好友的 **uid**。
 */
class Friend extends Contact {

    #uid;

    /**
     * 构造一个 **qq号** 为 `uin`，**uid** 为 `uid` 的好友。
     * 
     * 该函数构造出的好友全局只有一个实例，相同的 `uin` 和 `uid` 将会返回相同的对象。
     * 
     * 在任何情况下，都应该使用该函数来构造好友，而非直接使用构造器。
     * 
     * @param { String } uin 好友的 **qq号**。
     * @param { String } uid 好友的 **uid**。
     * @returns { Friend } 构造出的好友。
     */
    static make(uin, uid) {
        return Cache.withCache(`friend-${ uin }-${ uid }`, () => new Friend(uin, uid));
    }

    /**
     * 构造一个 **qq号** 为 `uin`，**uid** 为 `uid` 的好友。
     * 
     * 注意：在任何情况下，都不应该直接使用该构造器来构造好友。相反地，你应该使用 `Friend.make(uin, uid)` 函数来构造好友。
     * 
     * @param { String } uin 好友的 **qq号**。
     * @param { String } uid 好友的 **uid**。
     */
    constructor(uin, uid) {
        super(uin);
        this.#uid = uid;
    }

    /**
     * 获取并返回该好友在原生qq中的对象。
     * 
     * @returns { Native } 原生好友对象。
     */
    getNative() {
        const buddyMap = app?.__vue_app__?.config?.globalProperties?.$store?.state?.common_Contact_buddy?.buddyMap;
        if (!buddyMap) {
            return null;
        }
        return buddyMap[this.#uid];
    }

    /**
     * 获取并返回该好友的昵称。
     * 
     * @returns { String } 昵称。
     */
    getNick() {
        return this.getNative()?.coreInfo?.nick;
    }

    /**
     * 获取并返回该好友的好友备注。
     * 
     * @returns { String } 好友备注。
     */
    getRemark() {
        return this.getNative()?.coreInfo?.remark;
    }

}

export default Friend