const fs = require("fs");
const config = require("../config");
const keyCreator = require("./keyCreator");

class DocumentStorage {

    constructor(storagePath) {
        this.storagePath = storagePath;
        if(!fs.existsSync(storagePath))
            fs.mkdirSync(storagePath);
    }

    save(text) {
        const key = keyCreator.create();
        try {
            fs.writeFileSync(this.storagePath + "/" + key, text);
        } catch (e) {
            return null;
        }
        return key;
    }

    load(key) {
        const path = this.storagePath + "/" + key;
        console.log(path);

        if(!fs.existsSync(path))
            return null;

        return fs.readFileSync(path, "utf8");
    }

}

module.exports = new DocumentStorage(config.document.storagePath);