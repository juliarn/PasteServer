const config = require("../config");
const fs = require("fs");

class FileStorage {

    constructor(storageConfig) {
        this.path = storageConfig.path;
        if (!fs.existsSync(this.path)) {
            fs.mkdir(this.path, error => {
                if (error)
                    console.error("Failed to mkdir folder.", error);
            });
        }
    }

    save(key, deleteSecret, text, isStatic) {
        const self = this;
        return new Promise(resolve => {
            fs.writeFile(self.path + "/" + key,
                JSON.stringify({
                    deleteSecret,
                    text,
                    isStatic
                }), error => {
                    if (error) {
                        console.error("Failed to save document.", error);
                        resolve(false);
                    } else
                        resolve(true);
                }
            );
        });
    }

    load(key) {
        const self = this;
        return new Promise(resolve => {
            const documentPath = self.path + "/" + key;
            if (fs.existsSync(documentPath)) {
                fs.readFile(documentPath, (error, data) => {
                    if (error) {
                        console.error("Failed to load document.", error);
                        resolve(null);
                    } else
                        resolve(JSON.parse(data.toString("utf8")).text);
                });
            } else
                resolve(null);
        });
    }

    deleteBySecret(key, deleteSecret) {
        const self = this;
        return new Promise(resolve => {
            const documentPath = self.path + "/" + key;
            if (fs.existsSync(documentPath)) {
                fs.readFile(documentPath, (error, data) => {
                    if (error) {
                        console.error("Failed to load document.", error);
                        resolve(false);
                    } else {
                        const document = JSON.parse(data.toString("utf8"));
                        if (document.deleteSecret === deleteSecret) {
                            fs.unlink(documentPath, unlinkError => {
                                if (unlinkError) {
                                    console.error("Failed to delete document.", unlinkError);
                                    resolve(false);
                                } else
                                    resolve(true);
                            });
                        }
                    }
                });
            } else
                resolve(false);
        });
    }

    delete(key) {
        const self = this;
        return new Promise(resolve => {
            const documentPath = self.path + "/" + key;
            if (fs.existsSync(documentPath)) {
                fs.unlink(documentPath, unlinkError => {
                    if (unlinkError) {
                        console.error("Failed to delete document.", unlinkError);
                        resolve(false);
                    } else
                        resolve(true);
                });
            } else
                resolve(false);
        });
    }

}

module.exports = new FileStorage(config.storage);