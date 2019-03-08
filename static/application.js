class PasteServer {

    static showElement(element, show) {
        if(show)
            element.classList.remove("invisible");
        else
            element.classList.add("invisible");
    }

    static parseResponse(text) {
        if (text.trim() === "")
            return null;

        try {
            return JSON.parse(text);
        } catch (error) {
            console.log(`Failed to parse response: ${error.message}.`);
            return null;
        }
    }

    constructor() {
        this.codeBox = document.getElementById("codeBox");
        this.codeBoxLines = this.codeBox.querySelector(".codeLines");
        this.code = this.codeBox.querySelector("code");
        PasteServer.showElement(this.codeBox, false);

        this.textArea = document.querySelector("textarea");
        this.textBar = new TextBar(document.querySelector(".textBar"));
        this.textArea.select();

        this.currentDocument = new PasteDocument(this);

        this.setupShortcuts();
        this.setupButtons();
        this.setupModals();

        const url = window.location.href.split("/");
        if(url.length > 3) {
            const key = url[3];
            if(key.trim() !== "")
                this.currentDocument.load(key);
        }
    }

    setupShortcuts() {
        document.addEventListener("keydown", keyDownEvent => {
            if(keyDownEvent.ctrlKey) {
                switch (keyDownEvent.code) {
                    case "KeyS":
                        this.currentDocument.save(this.textArea.value);
                        keyDownEvent.preventDefault();
                        break;
                    case "KeyN":
                        const url = window.location.href.split("/");
                        if(url.length > 2)
                            window.location.href = "http://" + url[2];
                        keyDownEvent.preventDefault();
                        break;
                    case "KeyD":
                        if(this.currentDocument.locked)
                            this.deleteModal.open();
                        keyDownEvent.preventDefault();
                        break;
                }
            }
        });
    }

    setupButtons() {
        document.getElementById("saveButton").addEventListener("click", () => this.currentDocument.save(this.textArea.value));
        document.getElementById("copyButton").addEventListener("click", () => {
            if (this.currentDocument.locked) {
                if (document.selection) {
                    const range = document.body.createTextRange();
                    range.moveToElementText(this.code);
                    range.select();
                } else if (window.getSelection) {
                    const range = document.createRange();
                    range.selectNode(this.code);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                }
            } else
                this.textArea.select();
            document.execCommand("copy");
        });
        document.getElementById("newDocButton").addEventListener("click", () => {
            const url = window.location.href.split("/");
            if(url.length > 2)
                window.location.href = "http://" + url[2];
        });
        document.getElementById("deleteButton").addEventListener("click", () => {
            if(this.currentDocument.locked)
                this.deleteModal.open();
        });

    }

    setupModals() {
        M.Modal.init(document.querySelectorAll(".modal"), {
            onCloseEnd: () => {
                this.deleteSecretInput.value = "";
                this.deleteSecretInput.nextElementSibling.classList.remove("active");
            }
        });
        this.deleteModal = M.Modal.getInstance(document.getElementById("deleteModal"));
        this.deleteSecretInput = document.getElementById("deleteSecretInput");
        document.getElementById("modalDeleteButton").addEventListener("click", () => this.currentDocument.delete(this.deleteSecretInput.value));
    }

    updateCodeLines(lineCount, codeLines) {
        while (codeLines.firstChild)
            codeLines.removeChild(codeLines.firstChild);

        for(let i = 1; i < lineCount + 1; i++) {
            const lineTextNode = document.createTextNode(i.toString());
            const lineBreakElement = document.createElement("br");

            codeLines.appendChild(lineTextNode);
            codeLines.appendChild(lineBreakElement);
        }
    }
}

class TextBar {

    constructor(element) {
        this.textBarElement = element;
        element.querySelector("i").addEventListener("click", () => this.hide());
        this.textBarText = element.querySelector("p");
    }

    show(text, time) {
        this.textBarText.innerText = text;
        this.textBarElement.classList.add("show");

        if(time)
            setTimeout(() => this.hide(), time);
    }

    hide() {
        this.textBarText.innerText = "";
        this.textBarElement.classList.remove("show");
    }

}

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
                        window.history.pushState({}, "PasteServer", "/" + key);
                        self.load(key);
                        self.pasteServer.textBar.show("Secret to delete paste: " + response.deleteSecret);
                    } else if (this.status === 413 || this.status === 429 || this.status === 400) {
                        const message = response.message;
                        self.pasteServer.textBar.show("Error while saving: " + message, 3000);
                    } else
                        self.pasteServer.textBar.show("Unexpected error occurred while saving", 3000);
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

                    document.title = "PasteServer - " + key;

                    self.pasteServer.updateCodeLines(response.text.split("\n").length, self.pasteServer.codeBoxLines);

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

    delete(secret) {
        if(!this.key || !this.locked)
            return;

        const request = new XMLHttpRequest();
        const self = this;
        request.onreadystatechange = function() {
            const response = PasteServer.parseResponse(this.responseText);
            if(response) {
                if (this.status === 200)
                    window.location.href = window.location.href.split(self.key)[0];
                else if (this.status === 403 || this.status === 400 || this.status === 429) {
                    const message = response.message;
                    self.pasteServer.textBar.show("Failed to delete document: " + message, 3000);
                } else
                    self.pasteServer.textBar.show("Unexpected error occurred while deleting", 3000);
            }
        };

        request.open("GET", "/documents/delete/" + this.key, true);
        request.setRequestHeader("deleteSecret", secret);
        request.send();
    }
}

document.addEventListener("DOMContentLoaded", () => new PasteServer());

