const {Command} = require("./commandProvider");
let documentStorage;

const deleteDocumentCommand = new Command("deleteDocument", "Delete a certain document", "deleteDocument <key>", args => {
    return false;
});

const readDocumentCommand = new Command("readDocument", "Read a certain document", "readDocument <key>", args => {
    return false;
});

module.exports = storage => {
    documentStorage = storage;
    return [deleteDocumentCommand, readDocumentCommand];
};