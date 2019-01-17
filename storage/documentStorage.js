const config = require("../config");
const keyCreator = require("./keyCreator");
const {Database} = require("arangojs");
const redis = require("redis");

class ArangoStorage {

    constructor(storageConfig) {
        const database = Database(`http://${storageConfig.host}:${storageConfig.port}`);
        database.useBasicAuth(storageConfig.user, storageConfig.password);

        database.createDatabase(storageConfig.database).then(() => database.useDatabase(storageConfig.database))
            .catch(error => console.error("Failed to create database", error));

        const collection = database.collection("pasteDocuments");
        collection.exists().then(exists => {
            if(exists)
                collection.create().catch(error => console.error("Failed to create collection", error));
        });

        this.collection = collection;
    }


    async save(text) {
        const key = keyCreator.create();
        try {
            await this.collection.save({
                _key: key,
                text: text
            });
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
        }
        return null;
    }

}

class RedisStorage {

    constructor(storageConfig) {
        this.client = redis.createClient({
            host: storageConfig.host,
            port: storageConfig.port,
            password: storageConfig.password
        });
        this.client.on("error", error => console.log("Redis error occured", error));
    }

    save(text) {
        const self = this;
        const key = keyCreator.create();
        return new Promise((resolve, reject) => {
            self.client.hmset(key, {text: text}, error => {
                if(error)
                    reject(error);
                resolve(key);
            });
        });
    }

    load(key) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.client.hgetall(key, (error, object) => {
                if(error)
                    reject(error);
                if(!object || !object.text)
                    resolve(null);
                else
                    resolve(object.text);
            });
        });
    }

}

module.exports = config.storage.type === "arangodb" ? new ArangoStorage(config.storage) : new RedisStorage(config.storage);