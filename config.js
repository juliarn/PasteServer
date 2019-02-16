module.exports = {
    server: {
        port: 5000
    },
    autoUpdate: {
        enabled: false,
        packageJsonLink: "https://raw.githubusercontent.com/realPanamo/PasteServer/master/package.json",
        keepFiles: ["config.js"]
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
        dataLimit: "2mb",
        maxLength: 400000
    },
    keyGenerator: {
        keyLength: 10,
        keyChars: "abcdefghijklmnopqrstivwxyz0123456789",
        withToUpperCase: true
    },
};