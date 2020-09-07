const config = require("../config");
const { Database } = require("arangojs");

class ArangoStorage {
F
    constructor(storageConfig) {
        const database = new Database(`http://${storageConfig.host}:${storageConfig.port}`);
        database.useBasicAuth(storageConfig.user, storageConfig.password);

        database.listDatabases().then(databases => {
            if (databases.indexOf(storageConfig.database) === -1) {
                database.createDatabase(storageConfig.database).then()
                    .catch(error => console.error("Failed to create database.", error));
            }
        });

        database.useDatabase(storageConfig.database);

        const expire = storageConfig.documentExpireInMs / 1000;

        const collection = database.collection("pasteDocuments");
        collection.exists().then(exists => {
            if (!exists) {
                collection.create().then(() => {
                    collection.ensureIndex({
                        type: "ttl",
                        fields: ["lastAccessedAt"],
                        expireAfter: expire
                    });
                }).catch(error => console.error("Failed to create collection.", error));
            } else {
                collection.ensureIndex({
                    type: "ttl",
                    fields: ["lastAccessedAt"],
                    expireAfter: expire
                });
            }
        });

        this.collection = collection;
    }


    async save(key, deleteSecret, text, isStatic) {
        try {
            await this.collection.save({
                _key: key,
                deleteSecret,
                text,
                isStatic,
                lastAccessedAt: Date.now()
            });
        } catch (error) {
            console.error("Failed to save document.", error);
            return false;
        }
        return true;
    }

    async load(key) {
        if (!await this.collection.documentExists(key))
            return null;
        try {
            const document = await this.collection.document(key);

            document.lastAccessedAt = Date.now();
            await this.collection.save(document);

            return document.text;
        } catch (error) {
            console.error("Failed to load document.", error);
        }
        return null;
    }

    async deleteBySecret(key, deleteSecret) {
        if (!await this.collection.documentExists(key))
            return false;
        try {
            const document = await this.collection.document(key);
            if (document.deleteSecret === deleteSecret) {
                await this.collection.remove(key);
                return true;
            }
        } catch (error) {
            console.error("Failed to delete document.", error);
        }
        return false;
    }

    async delete(key) {
        if (!await this.collection.documentExists(key))
            return false;
        try {
            await this.collection.remove(key);
            return true;
        } catch (error) {
            return false;
        }
    }

}

module.exports = new ArangoStorage(config.storage);