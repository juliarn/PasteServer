module.exports = {
    server: {
        port: 5000
    },
    autoUpdate: {
        enabled: false,
        packageJsonURL: "https://raw.githubusercontent.com/juliarn/PasteServer/master/package.json",
        zipURL: "https://github.com/juliarn/PasteServer/archive/master.zip",
        keepFiles: [],
        devPackageJsonURL: "https://raw.githubusercontent.com/juliarn/PasteServer/development/package.json",
        devZipUrl: "https://github.com/juliarn/PasteServer/archive/development.zip"
    },
    storage: {
        type: "file",
        host: "127.0.0.1",
        port: 6379,
        password: "",
        // only arangodb
        user: "root",
        database: "pasteServer",
        // only redis
        documentExpireInMs: 3 * 24 * 60 * 60 * 1000,
        // only file
        path: "data"
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