const config = require("../config");
const {Database} = require("arangojs");

class ArangoStorage {

    constructor(storageConfig) {
        const database = new Database(`http://${storageConfig.host}:${storageConfig.port}`);
        database.useBasicAuth(storageConfig.user, storageConfig.password);

        database.listDatabases().then(databases => {
            if(databases.indexOf(storageConfig.database) === -1) {
                database.createDatabase(storageConfig.database).then()
                    .catch(error => console.error("Failed to create database.", error));
            }
        });

        database.useDatabase(storageConfig.database);

        const collection = database.collection("pasteDocuments");
        collection.exists().then(exists => {
            if(!exists)
                collection.create().catch(error => console.error("Failed to create collection.", error));
        });

        this.collection = collection;
    }


    async save(key, deleteSecret, text, isStatic) {
        try {
            await this.collection.save({
                _key: key,
                text: text,
                deleteSecret: deleteSecret,
                isStatic: isStatic
            });
        } catch (error) {
            console.error("Failed to save document.", error);
            return false;
        }
        return true;
    }

    async load(key) {
        if(!await this.collection.documentExists(key))
            return null;
        try {
            const document = await this.collection.document(key);
            return document.text;
        } catch (error) {
            console.error("Failed to load document.", error);
        }
        return null;
    }

    async deleteBySecret(key, deleteSecret) {
        if(!await this.collection.documentExists(key))
            return false;
        try {
            const document = await this.collection.document(key);
            if(document.deleteSecret === deleteSecret) {
                await this.collection.remove(key);
                return true;
            }
        } catch (error) {
            console.error("Failed to delete document.", error);
        }
        return false;
    }

    async delete(key) {
        if(!await this.collection.documentExists(key))
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