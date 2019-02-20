(async () => {
    const express = require("express");
    const app = express();

    const serveStatic = require("serve-static");
    const bodyParser = require("body-parser");
    const config = require("./config");
    const autoUpdater = require("./autoUpdater");

    const updateAvailable = await autoUpdater.checkForUpdates();
    if(updateAvailable && config.autoUpdate.enabled) {
        if(await autoUpdater.downloadUpdate())
            await autoUpdater.installUpdate();
    }

    const documentStorage = config.storage.type === "arangodb" ? require("./storage/arangoStorage") : require("./storage/redisStorage");
    const {CommandProvider, defaultCommand} = require("./commands/commands");

    const commandProvider = new CommandProvider(defaultCommand);
    commandProvider.registerCommands((require("./commands/documentCommands")(documentStorage)));
    commandProvider.registerCommands((require("./commands/updateCommands")(autoUpdater)));

    // bodyParser to handle requests in json-format
    app.use(bodyParser.json({limit: config.document.dataLimit, extended: true}));
    app.use(bodyParser.urlencoded({limit: config.document.dataLimit, extended: true}));

    // setting route for the rest api
    app.use("/documents", (require("./routes/documents")(documentStorage)));
    // sending the static files on the root and when the url contains a key
    app.use(serveStatic(__dirname + "/static"));
    app.use("/:key", serveStatic(__dirname + "/static"));
    // else, redirecting to the root
    app.use((request, response) => response.redirect("/"));

    console.log(`Trying to start the server on port ${config.server.port}`);
    app.listen(config.server.port, console.log(`The server was started successfully on port ${config.server.port}`));
})();


