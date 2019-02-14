# PasteServer
PasteServer to upload text or code.
Demo: https://paste.dsyn.ga

# Usage
To use the server, just download this repo and install [Node.js](http://www.nodejs.org/) and [Redis](http://www.redis.io/) or
[ArangoDB](http://www.arangodb.com/) for the document-storage.
Now you can edit the ``config.js`` the way you want to. 

After you did that, you have to install the dependencies the server needs. Just execute this:

```bash
npm install
```

Now you can start the server with the following:

```bash
npm start
```

# Config

## Server-section
To configure the server itself

*  **port**: The port where the server will run on.

## Storage-section
To configure the document-storage

*  **type**: The type of the storage. ("redis" or "arangodb")
*  **host**: The Host of the storage-type.
*  **port**: The Port of the storage-type.
*  **password**: The Password of the storage-type.

*  **user**: The user to use for the authentication. (only ArangoDB)
*  **database**: The database to store the documents in. (only ArangoDB)

*  **documentExpireInMs**: The time in milliseconds after a document will be deleted when unused. (only Redis)

## Ratelimit-section
To configure the rateLimits of creating documents

*  **timeInMs**: The time in milliseconds in which a certain amount of requests are allowed per IP.
*  **maxRequestsPerTime**: The allowed amount of requests per IP per time.

## Document-section
To configure documents

*  **dataLimit**: The max. size the data of a creation-request is allowed to have.
*  **maxLength**: The max. characters a document is allowed to have.

## KeyGenerator-section
To configure the creation of the document-keys

*  **keyLength**: The length of a key.
*  **keyChars**: The characters that will be used to create a key.
*  **withToUpperCase**: When set to true, the keyChars will be duplicated and added to the current 
keyChars but with all letters in uppercase.

# API

You can use the API of the PasteServer to create, read and delete documents. All API requests can be made 
to the /documents-route (for example https://paste.dsyn.ga/documents).

## Create a document

Send a POST-request and as the body, a JSON containing the key ``text`` with the wanted text als value.
```json
{
  "text": "This is a text."
}
```

If everything succeeded, you'll get the following response:

* **Status-Code**: 201 Created
* **Body**: A JSON containing the key ``key`` and ``deleteSecret`` for the key and secret of the document.

If the text you want to save is too long, you'll get the following back:

* **Status-Code**: 413 Payload Too Large

If there was an error while saving the document, you'll get this:

* **Status-Code**: 500 Internal Server Error

Both of them contain this:

* **Body**: A JSON containing the key ```message``` for a short description of the issue while saving.

## Read a document

Send a GET-request to the /documents-route + the key of the wanted document
(for example https://paste.dsyn.ga/documents/key).

If the document exists, you'll get the following response:

* **Status-Code**: 200 OK
* **Body**: A JSON containing the key ``text`` for the text of the document.

If not, this:

* **Status-Code**: 404 Not Found
* **Body**: A JSON containing the key ```message``` for a short description of the issue while getting.

## Delete a document

Send a GET-request to the /documents/delete-route + the key of the wanted document
(for example https://paste.dsyn.ga/documents/delete/key). 
Add a header with the name ```deleteSecret``` and add the secret of the document as value.

If everything succeeded, you'll get the following response:

* **Status-Code**: 200 OK

If the deleteSecret is missing, the following:

* **Status-Code**: 400 Bad Request

If the secret or the key is wrong, this:

* **Status-Code**: 403 Forbidden

Every response contains this:

 * **Body**: A JSON containing the key ```message``` for a short description of what happened.