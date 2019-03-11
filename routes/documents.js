const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const config = require("../config");
const keyCreator = require("../storage/keyCreator");
let documentStorage;

// Putting a rateLimit on the creating and deleting of documents to avoid crashes
const rateLimit = require("express-rate-limit");
const rateLimitHandler = rateLimit({
    windowMs: config.createRateLimit.timeInMs,
    max: config.createRateLimit.maxRequestsPerTime,
    message: {message: "Request limit reached. Try again later"}
});

const rawBodyHandler = (request, response, next) => {
    request.setEncoding("utf8");
    let rawBody = "";

    request.on("data", data => rawBody += data);
    request.on("end", () => {
        request.rawBody = rawBody;
        next();
    }) ;
};

router.post("/", rateLimitHandler, rawBodyHandler, async (request, response) => {
    const text = request.rawBody;

    response.setHeader("Content-Type", "application/json");

    if(!text) {
        response.status(400).json({message: "You have to enter the text of the paste"});
        return;
    }

    const maxLength = config.document.maxLength;
    if(text && text.length < maxLength) {
        const key = keyCreator.create();

        const secretChars = "abcdefghijklmnopqrstuvwxyz0123456789!§$%&/()=?{[]}";
        const deleteSecret = keyCreator.create(Math.floor(Math.random() * 16) + 12, secretChars + secretChars.toUpperCase());
        const deleteSecretHash = crypto.createHash("sha256").update(deleteSecret).digest("hex");

        if(await documentStorage.save(key, deleteSecretHash, text, false)) {
            console.log(`Created document: ${key}.`);
            response.status(201).json({key: key, deleteSecret: deleteSecret});
        } else
            response.status(500).json({message: "Failed to save document"});
    } else
        response.status(413).json({message: `Text too long (max. ${maxLength})`});
});

router.get("/", (request, response) => {
    response.redirect("/");
});

router.get("/:key", async (request, response) => {
    const key = request.params.key;

    response.setHeader("Content-Type", "application/json");

    const text = await documentStorage.load(key);

    if(text == null)
        response.status(404).json({message: "No document found"});
    else {
        console.log(`Sending document: ${key}.`);
        response.json({text: text});
    }
});

router.get("/delete/:key", rateLimitHandler, async (request, response) => {
    const key = request.params.key;
    const deleteSecret = request.headers.deletesecret;

    response.setHeader("Content-Type", "application/json");

    if(!deleteSecret) {
        response.status(400).json({message: "You have to enter the secret of the paste"});
        return;
    }

    const deleteSecretHash = crypto.createHash("sha256").update(deleteSecret).digest("hex");
    if(await documentStorage.deleteBySecret(key, deleteSecretHash)) {
        console.log(`Deleted document: ${key}.`);
        response.json({message: "Success"});
    } else
        response.status(403).json({message: "You entered the wrong secret or the document does not exist"});

});

module.exports = storage => {
    documentStorage = storage;
    return router;
};