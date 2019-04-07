class PasteServer {

    static showElement(element, show) {
        if(show)
            element.classList.remove("invisible");
        else
            element.classList.add("invisible");
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
    }

    async readURL() {
        const url = window.location.href.split("/");
        if(url.length > 3) {
            const key = url[3];
            if(key.trim() !== "")
                await this.currentDocument.load(key);
        }
    }

    setupShortcuts() {
        document.addEventListener("keydown", async keyDownEvent => {
            if(keyDownEvent.ctrlKey) {
                switch (keyDownEvent.code) {
                    case "KeyS":
                        keyDownEvent.preventDefault();
                        await this.currentDocument.save(this.textArea.value);
                        break;
                    case "KeyN":
                        keyDownEvent.preventDefault();
                        const url = window.location.href.split("/");
                        if(url.length > 2)
                            window.location.href = "http://" + url[2];
                        break;
                    case "KeyD":
                        keyDownEvent.preventDefault();
                        if(this.currentDocument.locked)
                            this.deleteModal.open();
                        break;
                    case "KeyC":
                        if(keyDownEvent.altKey) {
                            keyDownEvent.preventDefault();
                            this.copyToClipboard();
                        }
                        break;
                }
            }
        });
    }

    setupButtons() {
        document.getElementById("saveButton").addEventListener("click", async () =>  await this.currentDocument.save(this.textArea.value));
        document.getElementById("copyButton").addEventListener("click", () => this.copyToClipboard());
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
        M.Modal.init(document.querySelectorAll(".modal"), {});

        this.deleteModal = M.Modal.getInstance(document.getElementById("deleteModal"));
        this.deleteModal.options.onCloseEnd = () => {
            this.deleteSecretInput.value = "";
            this.deleteSecretInput.nextElementSibling.classList.remove("active");
        };

        this.deleteSecretInput = document.getElementById("deleteSecretInput");
        document.getElementById("modalDeleteButton").addEventListener("click",
            async () => await this.currentDocument.delete(this.deleteSecretInput.value));
    }

    copyToClipboard() {
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
    }

    updateCodeLines(lineCount) {
        const codeLines = this.codeBoxLines;

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

    async save(text) {
        if(text.trim() === "")
            return;

        if(!this.locked) {
            try {
                const response =  await fetch("/documents", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: text
                });

                const json = await response.json();
                if(response.ok) {
                    const key = json.key;

                    window.history.pushState({}, "PasteServer", "/" + key);
                    await this.load(key);

                    this.pasteServer.textBar.show("Secret to delete paste: " + json.deleteSecret);
                } else if(json.message) {
                    const message = json.message;
                    this.pasteServer.textBar.show("Error while saving: " + message, 3000);
                } else
                    this.pasteServer.textBar.show("Unexpected error occurred while saving", 3000);

            } catch (error) {
                console.error("Error while saving document: ", error);
            }
        }
    }

    async load(key) {
        try {
            const response = await fetch("/documents/" + key, {method: "GET"});

            if (response.ok) {
                const documentText = (await response.json()).text;

                PasteServer.showElement(this.pasteServer.codeBox, true);
                PasteServer.showElement(this.pasteServer.textArea, false);

                document.title = "PasteServer - " + key;

                this.pasteServer.updateCodeLines(documentText.split("\n").length);

                this.pasteServer.code.innerHTML = hljs.highlightAuto(documentText).value;
                this.pasteServer.textArea.readOnly = true;
                this.locked = true;

                this.key = key;
            } else
                window.location.href = window.location.href.split(key)[0];

        } catch (error) {
            console.error("Error while loading document: ", error)
        }
    }

    async delete(secret) {
        if(!this.key || !this.locked)
            return;

        try {
            const response = await fetch("/documents/delete/" + this.key, {
                method: "GET",
                headers: {"deleteSecret": secret}
            });

            const json = await response.json();
            if (response.ok)
                window.location.href = window.location.href.split(self.key)[0];
            else if (json.message) {
                const message = json.message;
                this.pasteServer.textBar.show("Failed to delete document: " + message, 3000);
            } else
                this.pasteServer.textBar.show("Unexpected error occurred while deleting", 3000);

        } catch (error) {
            console.error("Error while deleting document: ", error)
        }
    }

}

document.addEventListener("DOMContentLoaded", async () => {
    const pasteServer = new PasteServer();
    await pasteServer.readURL();
});