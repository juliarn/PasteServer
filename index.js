const express = require("express");
const app = express();

const serveStatic = require("serve-static");
const bodyParser = require("body-parser");
const config = require("./config");


// bodyParser to handle requests in json-format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// setting route for the rest api
app.use("/documents", require("./routes/documents"));
// sending the static files on the root and when the url contains a key
app.use(serveStatic(__dirname + "/static"));
app.use("/:key", serveStatic(__dirname + "/static"));
// else, redirecting to the root
app.use((request, response) => response.redirect("/"));

app.listen(config.server.port, console.log(`The server was started successfully on port ${config.server.port}`));