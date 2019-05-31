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
        this.client.on("error", error => console.error("Redis error occured.", error));
        this.expire = storageConfig.documentExpireInMs;
    }

    save(key, deleteSecret, text, isStatic) {
        const self = this;
        return new Promise(resolve => {
            self.client.hmset(key, {
                deleteSecret,
                text,
                isStatic
            }, error => {
                if(error) {
                    console.error("Failed to save document.", error);
                    resolve(false);
                }
                if(!isStatic)
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
                    console.error("Failed to load document.", error);

                if(object && object.text) {
                    if(!object.isStatic)
                        self.client.expire(key, self.expire);
                    resolve(object.text);
                } else
                    resolve(null)
            });
        });
    }

    deleteBySecret(key, deleteSecret) {
        const self = this;
        return new Promise(resolve => {
            self.client.hgetall(key, (error, object) => {
                if(error)
                    console.error("Failed to load document.", error);

                if(!object || !object.deleteSecret)
                    resolve(false);
                else if(object.deleteSecret === deleteSecret) {
                    self.client.del(key, error => {
                        if(error) {
                            console.error("Failed to delete document.", error);
                            resolve(false);
                        }
                        resolve(true);
                    });
                } else
                    resolve(false);

            });
        });
    }

    delete(key) {
        const self = this;
        return new Promise(resolve => {
            self.client.exists(key, (error, response) => {
               if(error) {
                   resolve(false);
                   return;
               }
               if(response === 1) {
                   self.client.del(key, error => {
                       if(error) {
                           resolve(false);
                           return;
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