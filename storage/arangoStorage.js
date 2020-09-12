const {Database} = require("arangojs");

class ArangoStorage {

    async prepare(storageConfig) {
        let database = new Database(`http://${storageConfig.host}:${storageConfig.port}`);
        database.useBasicAuth(storageConfig.user, storageConfig.password);

        try {
            const databases = await database.listDatabases();

            if (databases.indexOf(storageConfig.database) === -1) {
                await database.createDatabase(storageConfig.database);
            }
            database = database.database(storageConfig.database);

            const collection = database.collection("pasteDocuments");

            if (!await collection.exists()) {
                await collection.create();
            }
            this.collection = collection;

            const indexName = "ttl";

            const index = Array.from(await collection.indexes()).find(index => index.name === indexName);
            if (index) {
                await collection.dropIndex(index.name);
            }

            await collection.ensureIndex({
                name: indexName,
                type: "ttl",
                fields: ["lastAccessedAt"],
                expireAfter: storageConfig.documentExpireInMs / 1000,
            });
        } catch (error) {
            console.error("Failed to prepare arangodb storage.", error);
        }
    }

    async save(key, deleteSecret, text, isStatic) {
        try {
            await this.collection.save({
                _key: key,
                deleteSecret,
                text,
                isStatic,
                lastAccessedAt: Date.now() / 1000
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

            document.lastAccessedAt = Date.now() / 1000;
            await this.collection.replace(document._key, document);

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

module.exports = new ArangoStorage();