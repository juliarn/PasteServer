const {Command} = require("./commands");
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

module.exports = storage => {
    documentStorage = storage;
    return [deleteDocumentCommand, readDocumentCommand];
};