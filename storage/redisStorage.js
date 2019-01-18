const config = require("../config");
const keyCreator = require("./keyCreator");
const redis = require("redis");

class RedisStorage {

    constructor(storageConfig) {
        this.client = redis.createClient({
            host: storageConfig.host,
            port: storageConfig.port,
            password: storageConfig.password
        });
        this.client.on("error", error => console.log("Redis error occured", error));
        this.expire = storageConfig.documentExpireInMs;
    }

    save(text, creator) {
        const self = this;
        const key = keyCreator.create();
        return new Promise(resolve => {
            self.client.hmset(key, {text: text, creator: creator}, error => {
                if(error) {
                    console.error("Failed to save document", error);
                    resolve(null);
                }
                self.client.expire(key, self.expire);
                resolve(key);
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

    delete(key, creator) {
        const self = this;
        return new Promise(resolve => {
            self.client.hgetall(key, (error, object) => {
                if(error)
                    console.error("Failed to load document", error);

                if(!object || !object.creator)
                    resolve(false);
                else {
                    if(object.creator === creator) {
                        self.client.del(key, error => {
                            if(error) {
                                console.error("Failed to delete document", error);
                                resolve(false);
                            }
                            resolve(true);
                        });
                    }
                }
            });
        });
    }

}

module.exports = new RedisStorage(config.storage);