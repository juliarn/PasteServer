const express = require("express");
const app = express();

const serveStatic = require("serve-static");
const config = require("./config");

app.use(serveStatic("../web"));
app.use("/documents", require("./routes/documents"));

app.listen(config.server.port, console.log(`The server was started successfully on port ${config.server.port}`));