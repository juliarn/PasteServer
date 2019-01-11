document.addEventListener("DOMContentLoaded", () => {
   const textArea = document.querySelector("textarea");
   const saveButton = document.getElementById("saveButton");
   const currentDocument = new PasteDocument();

   const url = window.location.href.split("/");
   if(url.length > 1) {
      const key = url[1];
      currentDocument.load(key, textArea);
   }

   saveButton.addEventListener("click", () => currentDocument.save(textArea.value));
});

class PasteDocument {

   constructor() {
       this.locked = false;
   }

   save(text) {
       if(text.trim() === "")
           return;

       if(!this.locked) {
           this.locked = true;
           const request = new XMLHttpRequest();
           request.onreadystatechange = function() {

               let response;
               try {
                   response = JSON.parse(this.responseText);
               } catch (e) {
                   return;
               }

               if(this.status === 201) {
                   const key = response.key;
                   //window.location.href = window.location.href + key;
               } else if(this.status === 406) {
                   const message = response.message;
                   console.log(message);
               }
           };
           request.open("POST", "/documents", true);
           request.setRequestHeader("Content-Type", "application/json")
           request.send(JSON.stringify({text: text}));
       }
   }

   load(key, textArea) {
       const request = new XMLHttpRequest();
       request.onreadystatechange = function() {
           let response;
           try {
               response = JSON.parse(this.responseText);
           } catch (e) {
               return;
           }

           if(this.status === 200) {
               textArea.value = response.text;
               PasteDocument.this.locked = true;
               textArea.readOnly = true;
           } else if(this.status === 404) {
               const message = response.message;
               console.log(message);
           }
       };
       request.open("GET", "/documents", true);
   }

}
