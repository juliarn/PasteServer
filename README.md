# PasteServer
PasteServer to upload text or code

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

*  port: The port where the server will run on.

## Storage-section
To configure the document-storage

*  type: The type of the storage. ("redis" or "arangodb")
*  host: The Host of the storage-type.
*  port: The Port of the storage-type.
*  password: The Password of the storage-type.

*  user: The user to use for the authentication. (only ArangoDB)
*  database: The database to store the documents in. (only ArangoDB)

## Ratelimit-section
To configure the rateLimits of creating documents

*  timeInMs: The time in milliseconds in which a certain amount of requests are allowed per IP.
*  maxRequestsPerTime: The allowed amount of requests per IP per time.

## Document-section
To configure documents

*  dataLimit: The max. size the data of a creation-request is allowed to have.
*  maxLength: The max. characters a document is allowed to have.

## KeyGenerator-section
To configure the creation of the document-keys

*  keyLength: The length of a key.
*  keyChars: The characters that will be used to create a key.
*  withToUpperCase: When set to true, the keyChars will be duplicated and added to the current keyChars but with all letters in uppercase.

