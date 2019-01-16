const config = require("../config");
const keyCreator = require("./keyCreator");
const {Database} = require("arangojs");

class DocumentStorage {

    async save(text) {}

    async load(key) {}

}

class ArangoStorage extends DocumentStorage {

    async constructor(storageConfig) {
        super();
        const database = Database(`http://${storageConfig.host}:${storageConfig.port}`);
        database.useBasicAuth(storageConfig.user, storageConfig.password);

        database.createDatabase(storageConfig.database).then(() => database.useDatabase(storageConfig.database))
            .catch(error => console.error("Failed to create database", error));

        const collection = database.collection("pasteDocuments");
        if(!await collection.exists())
            collection.create().catch(error => console.error("Failed to create collection", error));

        this.collection = collection;
    }


    async save(text) {
        const key = keyCreator.create();
        const document = {
            _key: key,
            text: text
        };
        try {
            await this.collection.save(document);
        } catch (error) {
            console.error("Failed to save document", error);
        }
        return key;
    }

    async load(key) {
        if(!await this.collection.documentExists(key))
            return null;
        try {
            const document = await this.collection.document(key);
            return document.text;
        } catch (error) {
            console.error("Failed to load document", error);
            return null;
        }
    }

}

class RedisStorage extends DocumentStorage {

    constructor(storageConfig) {
        super();
    }

    async save(text) {}

    async load(key) {}

}

module.exports = config.storage.type === "arangodb" ? new ArangoStorage(config.storage) : new RedisStorage(config.storage);