module.exports = {
    server: {
        port: 5000
    },
    autoUpdate: {
        enabled: false,
        packageJsonURL: "https://raw.githubusercontent.com/realPanamo/PasteServer/master/package.json",
        zipURL: "https://github.com/realPanamo/PasteServer/archive/master.zip",
        keepFiles: [],
        devPackageJsonURL: "https://raw.githubusercontent.com/realPanamo/PasteServer/development/package.json",
        devZipUrl: "https://github.com/realPanamo/PasteServer/archive/development.zip"
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
        maxRequestsPerTime: 15
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