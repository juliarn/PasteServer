module.exports = {
    server: {
        port: 5000
    },
    document: {
        maxLength: 40000,
        storagePath: "./documents"
    },
    keyGenerator: {
        keyLength: 10,
        keyChars: "abcdefghijklmnopqrstivwxyz0123456789",
        withToUpperCase: true
    },
    fileMaxAge: 60000
};