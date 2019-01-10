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
        fs.writeFile(this.storagePath + "/" + key, text, error => {
           if(error)
               console.log("Error while writing file: " + error.stack);

           console.log("Document saved: " + key);
           return key;
        });
    }

    load(key) {
        const path = this.storagePath + "/" + key;

        if(!fs.existsSync(path))
            return null;

        return fs.readFileSync(path).data;
    }

}

module.exports = new DocumentStorage(config.document.storagePath);