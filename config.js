module.exports = {
    server: {
        port: 5000
    },
    storage: {
        type: "redis",
        host: "127.0.0.1",
        port: 6379,
        password: "",
        // only arangodb
        user: "root",
        database: "pasteServer",
        // only redis
        documentExpireInMs: 3 * 24 * 60 * 60 * 1000
    },
    createRateLimit: {
        timeInMs: 60 * 1000,
        maxRequestsPerTime: 30
    },
    document: {
        dataLimit: "10mb",
        maxLength: 30000
    },
    keyGenerator: {
        keyLength: 10,
        keyChars: "abcdefghijklmnopqrstivwxyz0123456789",
        withToUpperCase: true
    },
};