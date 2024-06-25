/**
 * `Contact` 类型代表所有的联系人。
 * 
 * @property { String } #id 该联系人的标识，在 `Friend` 中表示好友的 **qq号**，在 `Group` 中表示群聊的 **群号**。
 */
class Contact {

    #id;

    /**
     * 仅供子类调用。
     * 
     * @param { String } id 在 `Friend` 中表示好友的 **qq号**，在 `Group` 中表示群聊的 **群号**。
     */
    constructor(id) {
        this.#id = id;
    }

    /**
     * 返回该联系人的 `#id` 属性。
     * 
     * @returns { String } 该联系人的 `#id` 属性。
     */
    getId() {
        return this.#id;
    }

}

export default Contact