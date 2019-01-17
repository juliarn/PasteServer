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
        database: "pasteServer"
    },
    createRateLimit: {
        timeInMs: 60 * 1000,
        maxRequestsPerTime: 30
    },
    document: {
        maxLength: 50000,
        storagePath: "./documents"
    },
    keyGenerator: {
        keyLength: 10,
        keyChars: "abcdefghijklmnopqrstivwxyz0123456789",
        withToUpperCase: true
    },
};