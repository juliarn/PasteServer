const {Command} = require("./commands");
const fs = require("fs");
const path = require("path");
let documentStorage;

const deleteDocumentCommand = new Command("deleteDocument", "Deletes a certain document", "deleteDocument <key>", async args => {
    if(args.length === 1) {
        const message = await documentStorage.delete(args[0]) ? "Successfully deleted document!" : "Document could not be deleted.";
        console.log(message);
        return true;
    }
    return false;
});

const readDocumentCommand = new Command("readDocument", "Reads a certain document", "readDocument <key>", async args => {
    if(args.length === 1) {
        const documentText = await documentStorage.load(args[0]);
        if(documentText)
            console.log(`Text of the document: ${documentText}.`);
        else
            console.log("Document could not be read.");
        return true;
    }
    return false;
});

const createStaticDocumentCommand = new Command("createStaticDocument", "Creates a static document", "createStaticDocument <name> <contentFilePath>", async args => {
    if(args.length === 2) {
        const name = args[0];
        try {
            const text = fs.readFileSync(path.resolve(args[1]), {encoding: "utf-8"});

            if(await documentStorage.save(name, "static", text, true))
                console.log(`Successfully created static file '${name}'.`)
        } catch (e) {
            console.log("Error while reading the file!")
        }
        return true;
    }
    return false;
});


module.exports = storage => {
    documentStorage = storage;
    return [deleteDocumentCommand, readDocumentCommand, createStaticDocumentCommand];
};