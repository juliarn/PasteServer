const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const config = require("../config");
const keyCreator = require("../storage/keyCreator");
const documentStorage = config.storage.type === "arangodb" ? require("../storage/arangoStorage") : require("../storage/redisStorage");

// Putting a rateLimit on the creating and deleting of documents to avoid crashes
const rateLimit = require("express-rate-limit");
const rateLimitHandler = rateLimit({
    windowMs: config.createRateLimit.timeInMs,
    max: config.createRateLimit.maxRequestsPerTime
});

router.post("/", rateLimitHandler, async (request, response) => {
    const text = request.body.text;

    response.setHeader("Content-Type", "application/json");

    const maxLength = config.document.maxLength;
    if(text.length < maxLength) {
        const key = keyCreator.create();

        const secretChars = "abcdefghijklmnopqrstuvwxyz0123456789!§$%&/()=?{[]}";
        const deleteSecret = keyCreator.create(Math.floor(Math.random() * 16) + 12, secretChars + secretChars.toUpperCase());
        const deleteSecretHash = crypto.createHash("sha256").update(deleteSecret).digest("hex");

        if(await documentStorage.save(key, deleteSecretHash, text)) {
            console.log("Created document: " + key);
            response.status(201).json({key: key, deleteSecret: deleteSecret});
        } else
            response.status(500).json({message: "Failed to save document"});
    } else
        response.status(400).json({message: `Text too long (max. ${maxLength})`});
});

router.get("/:key", async (request, response) => {
    const key = request.params.key;

    response.setHeader("Content-Type", "application/json");

    const text = await documentStorage.load(key);

    if(text == null)
        response.status(404).json({message: "No document found"});
    else {
        console.log("Sending document: " + key);
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
    if(await documentStorage.delete(key, deleteSecretHash)) {
        console.log("Deleted document: " + key);
        response.json({message: "Success"});
    } else
        response.status(403).json({message: "You entered the wrong secret or the document does not exist"});

});

router.get("/", (request, response) => {
    response.send("Usage of the REST-API - Create a document (post-request): Send a JSON which contains the key 'text' and the wanted text as value. " +
        "Response: JSON which contains the key 'key' for the key, the key 'deleteSecret' for the document-secret or 'message' when something went wrong. " +
        "Get a document (get-request): Create a get request to this route + /[key]. Response: JSON which contains the key 'text' for the text or 'message' when something went wrong. " +
        "Delete a document (get-request): Create a get request to this route + /delete/[key] and add a header 'deleteSecret'. Response: JSON which contains the key 'message'.");
});

module.exports = router;