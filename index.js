(async () => {
    const launchMillis = Date.now();

    const express = require("express");
    const app = express();

    const serveStatic = require("serve-static");
    const bodyParser = require("body-parser");
    const config = require("./config");
    const autoUpdater = require("./autoUpdater");

    console.log(`Starting PasteServer v${autoUpdater.currentVersion}...`);

    // update-check
    const updateAvailable = await autoUpdater.checkForUpdates();
    if (updateAvailable && config.autoUpdate.enabled) {
        if (await autoUpdater.downloadUpdate())
            await autoUpdater.installUpdate();
    }

    // connecting to the given database
    const database = config.storage.type;
    console.log(`Trying to use database '${database}'...`);
    const documentStorage = database === "file" ? require("./storage/fileStorage") :
        database === "arangodb" ? require("./storage/arangoStorage") : require("./storage/redisStorage");
    if (!documentStorage) {
        console.log(`There is no support for '${database}'!`);
        process.exit();
    }
    await documentStorage.prepare(config.storage);

    // bodyParser to handle requests in json-format
    const jsonParser = bodyParser.json({limit: config.document.dataLimit, extended: true});
    app.use((request, response, next) =>
        request.path.toLowerCase() === "/documents" && request.method === "POST" ? next() : jsonParser(request, response, next));

    // setting route for the rest api
    app.use("/documents", (require("./routes/documents")(documentStorage)));
    // sending the static files on the root and when the url contains a key
    app.use(serveStatic(__dirname + "/static"));
    app.use("/:key", serveStatic(__dirname + "/static"));
    // else, redirecting to the root
    app.use((request, response) => response.redirect("/"));


    console.log(`Trying to bind on port ${config.server.port}...`);
    if (config.ssl.enabled) {
        const https = require('https');
        const fs = require('fs');
    
        const httpsServer = https.createServer({
            key: fs.readFileSync(config.ssl.privkey),
            cert: fs.readFileSync(config.ssl.fullchain),
          }, app);
    
        httpsServer.listen(config.server.port, () => {
            console.log(`Now listening on port ${config.server.port}.`);
        });
    } else {
        app.listen(config.server.port, console.log(`Now listening on port ${config.server.port}.`));
    }

    // commands
    const {CommandProvider, defaultCommand} = require("./commands/commands");

    const commandProvider = new CommandProvider(defaultCommand);
    commandProvider.registerCommands((require("./commands/documentCommands")(documentStorage)));
    commandProvider.registerCommands((require("./commands/updateCommands")(autoUpdater)));

    console.log(`Done (${Date.now() - launchMillis}ms). Execute '${defaultCommand.name}' for a list of all commands.`)
})();


