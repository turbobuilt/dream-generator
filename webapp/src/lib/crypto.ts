if (!window.crypto) {
    // @ts-ignore
    window.crypto = {}
}
if (!window.crypto.randomUUID) {
    // @ts-ignore
    window.crypto.randomUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    console.log("random uuid", crypto.randomUUID())
}