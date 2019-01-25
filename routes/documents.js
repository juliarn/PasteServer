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
            response.status(201).send(JSON.stringify({key: key, deleteSecret: deleteSecret}));
        } else
            response.status(500).send(JSON.stringify({message: "Failed to save document"}));
    } else
        response.status(400).send(JSON.stringify({message: `Text too long (max. ${maxLength})`}));
});

router.get("/:key", async (request, response) => {
    const key = request.params.key;

    response.setHeader("Content-Type", "application/json");

    const text = await documentStorage.load(key);

    if(text == null)
        response.status(404).send(JSON.stringify({message: "No document found"}));
    else {
        console.log("Sending document: " + key);
        response.send(JSON.stringify({text: text}));
    }
});

router.get("/delete/:key", rateLimitHandler, async (request, response) => {
    const key = request.params.key;
    const deleteSecret = request.headers.deletesecret;

    response.setHeader("Content-Type", "application/json");

    if(!deleteSecret) {
        response.status(400).send(JSON.stringify({message: "You have to enter the secret of the paste"}));
        return;
    }

    const deleteSecretHash = crypto.createHash("sha256").update(deleteSecret).digest("hex");
    if(await documentStorage.delete(key, deleteSecretHash)) {
        console.log("Deleted document: " + key);
        response.send(JSON.stringify({message: "Success"}));
    } else
        response.status(403).send(JSON.stringify({message: "You entered the wrong secret or the document does not exist"}));

});

router.get("/", (request, response) => {
    response.send("Usage of the REST-API - Post to this route: Send a json which contains the key 'text' and the wanted text as value. " +
        "Response: json which contains the key 'key' for the key or 'message' when something went wrong. Get to this route: " +
        "Create a get request to this route + /[key]. Response: json which contains the key 'text' for the text or 'message' when something went wrong.");
});

module.exports = router;