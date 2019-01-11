const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const serveStatic = require("serve-static");
const config = require("./config");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(serveStatic("../web"));
app.use("/documents", require("./routes/documents"));

app.listen(config.server.port, console.log(`The server was started successfully on port ${config.server.port}`));