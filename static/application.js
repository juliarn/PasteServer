document.addEventListener("DOMContentLoaded", () => {
    const codeBox = document.getElementById("codeBox");
    const code = codeBox.querySelector("code");
    const textArea = document.querySelector("textarea");

    showElement(codeBox, false);

    const currentDocument = new PasteDocument(code, codeBox, textArea);

    const saveButton = document.getElementById("saveButton");
    const copyButton = document.getElementById("copyButton");
    const newDocButton = document.getElementById("newDocButton");
    const deleteButton = document.getElementById("deleteButton");

    saveButton.addEventListener("click", () => currentDocument.save(textArea.value));
    copyButton.addEventListener("click", () => {
        if (currentDocument.locked) {
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
            textArea.select();
        document.execCommand("copy");
    });
    newDocButton.addEventListener("click", () => {
        const url = window.location.href.split("/");
        if(url.length > 2)
            window.location.href = "http://" + url[2];
    });
    deleteButton.addEventListener("click", () => currentDocument.delete());

    const url = window.location.href.split("/");
    if(url.length > 3) {
        const key = url[3];
        if(key.trim() !== "")
            currentDocument.load(key);
    }
});

function showElement(element, show) {
    if(show)
        element.classList.remove("invisible");
    else
        element.classList.add("invisible");
}

class PasteDocument {

   constructor(code, codeBox, textArea) {
       this.locked = false;
       this.code = code;
       this.codeBox = codeBox;
       this.textArea = textArea;
       this.key = null;
   }

   save(text) {
       if(text.trim() === "")
           return;

       if(!this.locked) {
           const request = new XMLHttpRequest();
           request.onreadystatechange = function() {
               let response;
               try {
                   response = JSON.parse(this.responseText);
               } catch (e) {
                   console.log(e.message);
                   return;
               }

               if(this.status === 201) {
                   const key = response.key;
                   window.location.href = window.location.href + key;
               } else if(this.status === 406) {
                   const message = response.message;
                   console.log("Error while saving: " + message);
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
           let response;
           try {
               response = JSON.parse(this.responseText);
           } catch (e) {
               console.log(e.message);
               console.log("Response text: " + this.responseText);
               return;
           }

           if(this.status === 200) {
               showElement(self.codeBox, true);
               showElement(self.textArea, false);

               self.code.innerHTML = hljs.highlightAuto(response.text).value;
               self.textArea.readOnly = true;
               self.locked = true;

               self.key = key;
           } else if(this.status === 404)
               window.location.href = window.location.href.split(key)[0];

       };

       request.open("GET", "/documents/" + key, true);
       request.send();
   }

   delete() {
       if(!this.key)
           return;

       const request = new XMLHttpRequest();
       request.onreadystatechange = function() {
           let response;
           try {
               response = JSON.parse(this.responseText);
           } catch (e) {
               console.log(e.message);
               console.log("Response text: " + this.responseText);
               return;
           }

           if(this.status === 200)
               window.location.href = window.location.href.split(key)[0];
           else if(this.status === 403) {
               const message = response.message;
               console.log("Failed to delete document: " + message)
           }
       };

       request.open("GET", "/documents/delete/" + this.key, true);
       request.send();
   }

}
