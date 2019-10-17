# PasteServer
PasteServer to upload text or code.
Demo: https://pastes.gq

# Usage
To use the server, just download this repo and install [Node.js](http://www.nodejs.org/) and [Redis](http://www.redis.io/) or
[ArangoDB](http://www.arangodb.com/) for the document-storage. If you don't want to use one of these options, the server also supports a file-storage.
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

## autoUpdate-section
To configure the updating of the server

* **enabled**: If the server should perform autoUpdates before starting.
* **packageJsonURL**: The URL of the package.json file of the remote pasteServer.
* **zipURL**: The URL of the zip-archive with the files in it.
* **keepFiles**: The files which shouldn't be replaced when installing an update. Works too for files in dirs.
(use for example: ``static/index.html``).
* **devPackageJsonURL**: The URL of the package.json file of the remote development pasteServer.
* **devZipURL**: The URL of the development zip-archive with the files in it.

The last two options are only being used for the ``checkUpdate -dev`` and ``installUpdate -dev`` commands, which are not recommended. 
The dev-updates contain the newest features, but might have errors and might not be fully completed.

## Storage-section
To configure the document-storage

*  **type**: The type of the storage. ("file", "redis" or "arangodb")
*  **host**: The Host of the storage-type.
*  **port**: The Port of the storage-type.
*  **password**: The Password of the storage-type.

*  **user**: The user to use for the authentication. (only ArangoDB)
*  **database**: The database to store the documents in. (only ArangoDB)

*  **documentExpireInMs**: The time in milliseconds after a document will be deleted when unused. (only Redis)

*  **path**: The path of the folder the document-files should be saved in. (only file-storage)

## RateLimit-section
To configure the rateLimits of creating and deleting documents

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

Send a POST-request and as the body, the text the paste should have as plaintext.

If everything succeeded, you'll get the following response:

* **Status-Code**: 201 Created
* **Body**: A JSON containing the key ``key`` and ``deleteSecret`` for the key and secret of the document.

If the text is missing, the following:

* **Status-Code**: 400 Bad Request

If the text you want to save is too long, you'll get the following back:

* **Status-Code**: 413 Payload Too Large

If there was an error while saving the document, you'll get this:

* **Status-Code**: 500 Internal Server Error

The last three all contain this:

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
 
## RateLimits

There are rateLimits on creating and deleting documents to prevent attacks that might cause a crash.
The amount of allowed requests per time per ip can be changed in the ``config.js``.
Once the rateLimit is reached, you'll get the following response:

* **Status-Code**: 429 Too Many Requests
* **Body**: A JSON containing the key ```message``` for a short description of what happened.
