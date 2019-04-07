const config = require("../config");
const fs = require('fs');

class FileStorage {

    constructor(storageConfig) {
        this.path = storageConfig.path;
        if (!fs.existsSync(this.path)) {
            fs.mkdir(this.path, (err) => {
                if (err) {
                    console.error('Failed to mkdir folder.', err);
                }
            })
        }
    }

    save(key, deleteSecret, text, isStatic) {
        const self = this;
        return new Promise(resolve => {
            fs.writeFile(self.path + '/' + key,
                JSON.stringify({
                    key: key,
                    deleteSecret: deleteSecret,
                    text: text,
                    isStatic: isStatic
                }), (err) => {
                    if (err) {
                        console.error('Failed to save document.', err);
                        resolve(false);
                    } else resolve(true);
                }
            );
        });
    }

    load(key) {
        const self = this;
        return new Promise(resolve => {
            const documentPath = self.path + '/' + key;
            if (fs.existsSync(documentPath)) {
                fs.readFile(documentPath, (err, data) => {
                    if (err) {
                        console.error('Failed to load document', err);
                        resolve(null);
                    } else {
                        resolve(JSON.parse(data).text);
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    deleteBySecret(key, deleteSecret) {
        const self = this;
        return new Promise(resolve => {
            const documentPath = self.path + '/' + key;
            if (fs.existsSync(documentPath)) {
                fs.readFile(documentPath, (err, data) => {
                    if (err) {
                        console.error('Failed to load document', err);
                        resolve(false);
                    } else {
                        const document = JSON.parse(data);
                        if (document.deleteSecret === deleteSecret) {
                            fs.unlink(documentPath, err1 => {
                                if (err1) {
                                    console.error('Failed to delete document', err1);
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            })
                        }
                    }
                });
            } else {
                resolve(false);
            }
        });
    }

    delete(key) {
        const self = this;
        return new Promise(resolve => {
            const documentPath = self.path + '/' + key;
            if (fs.existsSync(documentPath)) {
                fs.readFile(documentPath, (err) => {
                    if (err) {
                        console.error('Failed to load document', err);
                        resolve(false);
                    } else {
                        fs.unlink(documentPath, err1 => {
                            if (err1) {
                                console.error('Failed to delete document', err1);
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        })
                    }
                });
            } else {
                resolve(false);
            }
        });
    }

}

module.exports = new FileStorage(config.storage);