const config = require("../config");
const redis = require("redis");

class RedisStorage {

    constructor(storageConfig) {
        this.client = redis.createClient({
            host: storageConfig.host,
            port: storageConfig.port
        });
        if(storageConfig.password)
            this.client.auth(storageConfig.password);
        this.client.on("error", error => console.log("Redis error occured", error));
        this.expire = storageConfig.documentExpireInMs;
    }

    save(key, deleteSecret, text) {
        const self = this;
        return new Promise(resolve => {
            self.client.hmset(key, {text: text, deleteSecret: deleteSecret}, error => {
                if(error) {
                    console.error("Failed to save document", error);
                    resolve(false);
                }
                self.client.expire(key, self.expire);
                resolve(true);
            });
        });
    }

    load(key) {
        const self = this;
        return new Promise(resolve => {
            self.client.hgetall(key, (error, object) => {
                if(error)
                    console.error("Failed to load document", error);

                if(!object || !object.text)
                    resolve(null);
                else {
                    self.client.expire(key, self.expire);
                    resolve(object.text);
                }
            });
        });
    }

    delete(key, deleteSecret) {
        const self = this;
        return new Promise(resolve => {
            self.client.hgetall(key, (error, object) => {
                if(error)
                    console.error("Failed to load document", error);

                if(!object || !object.deleteSecret)
                    resolve(false);
                else if(object.deleteSecret === deleteSecret) {
                    self.client.del(key, error => {
                        if(error) {
                            console.error("Failed to delete document", error);
                            resolve(false);
                        }
                        resolve(true);
                    });
                } else
                    resolve(false);

            });
        });
    }

}

module.exports = new RedisStorage(config.storage);