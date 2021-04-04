const config = require("../config");
const fs = require("fs");
const crypto = require("crypto");

class FileStorage {

    async prepare(storageConfig) {
        this.path = storageConfig.path;
        if (!fs.existsSync(this.path)) {
            fs.mkdir(this.path, error => {
                if (error)
                    console.error("Failed to mkdir folder.", error);
            });
        }
    }

    hashKey(key) {
        return crypto.createHash("sha256").update(key).digest("hex")
    }

    save(key, deleteSecret, text, isStatic) {
        key = this.hashKey(key);

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
        key = this.hashKey(key);

        const self = this;
        return new Promise(resolve => {
            const documentPath = self.path + "/" + key;
            if (fs.existsSync(documentPath)) {
                fs.readFile(documentPath, (error, data) => {
                    if (error) {
                        console.error("Failed to load document.", error);
                        resolve(null);
                    } else {
                        try {
                            resolve(JSON.parse(data.toString("utf8")).text);
                        } catch (error) {
                            console.error("Failed to load document.", error);
                            resolve(null);
                        }
                    }
                });
            } else
                resolve(null);
        });
    }

    deleteBySecret(key, deleteSecret) {
        key = this.hashKey(key);

        const self = this;
        return new Promise(resolve => {
            const documentPath = self.path + "/" + key;
            if (fs.existsSync(documentPath)) {
                fs.readFile(documentPath, (error, data) => {
                    if (error) {
                        console.error("Failed to load document.", error);
                        resolve(false);
                    } else {
                        try {
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
                        } catch (error) {
                            console.error("Failed to delete document.", error);
                            resolve(false);
                        }
                    }
                });
            } else
                resolve(false);
        });
    }

    delete(key) {
        key = this.hashKey(key);

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

module.exports = new FileStorage();