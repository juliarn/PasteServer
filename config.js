module.exports = {
    server: {
        port: 5000
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