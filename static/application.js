class PasteDocument {

    constructor(pasteServer) {
        this.pasteServer = pasteServer;
        this.locked = false;
        this.key = null;
    }

    save(text) {
        if(text.trim() === "")
            return;

        if(!this.locked) {
            const request = new XMLHttpRequest();
            const self = this;
            request.onreadystatechange = function() {
                const response = PasteServer.parseResponse(this.responseText);
                if(response) {
                    if (this.status === 201) {
                        const key = response.key;
                        window.location.href = window.location.href + key;
                    } else if (this.status === 400) {
                        const message = response.message;
                        self.pasteServer.showTextBar("Error while saving: " + message);
                    } else
                        self.pasteServer.showTextBar("Unexpected error occurred while saving");
                }
            };
            request.open("POST", "/documents", true);
            request.setRequestHeader("Content-Type", "application/json");
            request.send(JSON.stringify({text: text}));
        }
    }

    load(key) {
        const request = new XMLHttpRequest();
        const self = this;
        request.onreadystatechange = function() {
            const response = PasteServer.parseResponse(this.responseText);
            if(response) {
                if (this.status === 200) {
                    PasteServer.showElement(self.pasteServer.codeBox, true);
                    PasteServer.showElement(self.pasteServer.textArea, false);

                    self.pasteServer.code.innerHTML = hljs.highlightAuto(response.text).value;
                    self.pasteServer.textArea.readOnly = true;
                    self.locked = true;

                    self.key = key;
                } else
                    window.location.href = window.location.href.split(key)[0];
            }
        };

        request.open("GET", "/documents/" + key, true);
        request.send();
    }

    delete() {
        if(!this.key || !this.locked)
            return;

        const request = new XMLHttpRequest();
        const self = this;
        request.onreadystatechange = function() {
            const response = PasteServer.parseResponse(this.responseText);
            if(response) {
                if (this.status === 200)
                    window.location.href = window.location.href.split(self.key)[0];
                else if (this.status === 403) {
                    const message = response.message;
                    self.pasteServer.showTextBar("Failed to delete document: " + message);
                } else
                    self.pasteServer.showTextBar("Unexpected error occurred while deleting");
            }
        };

        request.open("GET", "/documents/delete/" + this.key, true);
        request.send();
    }

}

class PasteServer {

    static showElement(element, show) {
        if(show)
            element.classList.remove("invisible");
        else
            element.classList.add("invisible");
    }


    static parseResponse(text) {
        if (text.trim() === "") {
            console.log("Received empty response");
            return null;
        }
        try {
            return JSON.parse(text);
        } catch (error) {
            console.log("Failed to parse response: " + error.message);
            return null;
        }
    }

    constructor() {
        this.codeBox = document.getElementById("codeBox");
        this.code = this.codeBox.querySelector("code");
        this.textArea = document.querySelector("textarea");
        this.textBar = document.querySelector(".textBar");

        PasteServer.showElement(this.codeBox, false);

        this.currentDocument = new PasteDocument(this);

        this.saveButton = document.getElementById("saveButton");
        this.copyButton = document.getElementById("copyButton");
        this.newDocButton = document.getElementById("newDocButton");
        this.deleteButton = document.getElementById("deleteButton");

        this.setupButtons();

        const url = window.location.href.split("/");
        if(url.length > 3) {
            const key = url[3];
            if(key.trim() !== "")
                this.currentDocument.load(key);
        }
    }

    setupButtons() {
        this.saveButton.addEventListener("click", () => this.currentDocument.save(this.textArea.value));
        this.copyButton.addEventListener("click", () => {
            if (this.currentDocument.locked) {
                if (document.selection) {
                    const range = document.body.createTextRange();
                    range.moveToElementText(code);
                    range.select();
                } else if (window.getSelection) {
                    const range = document.createRange();
                    range.selectNode(code);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                }
            } else
                this.textArea.select();
            document.execCommand("copy");
        });
        this.newDocButton.addEventListener("click", () => {
            const url = window.location.href.split("/");
            if(url.length > 2)
                window.location.href = "http://" + url[2];
        });
        this.deleteButton.addEventListener("click", () => this.currentDocument.delete());
    }

    showTextBar(text) {
        this.textBar.innerText = text;
        this.textBar.classList.add("show");

        setTimeout(() => this.textBar.classList.remove("show"), 3000);
    }

}

document.addEventListener("DOMContentLoaded", () => new PasteServer());

