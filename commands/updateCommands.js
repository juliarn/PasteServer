const {Command} = require("./commands");
let autoUpdater;

const checkUpdateCommand = new Command("checkUpdate", "Checks for updates of the PasteServer", "checkUpdate [-dev]", async (args, provider) => {
    const dev = args.length === 1 && args[0].toLowerCase() === "-dev";
    if(args.length === 0 || dev) {
        provider.enabled = false;
        await autoUpdater.checkForUpdates(dev);
        provider.enabled = true;
        return true;
    }
    return false;
});

const installUpdateCommand = new Command("installUpdate", "Installs an update of the PasteServer, if available", "installUpdate [-dev]", async (args, provider) => {
    const dev = args.length === 1 && args[0].toLowerCase() === "-dev";
    if(args.length === 0 || dev) {
        provider.enabled = false;
        if(await autoUpdater.checkForUpdates(dev)) {
            if (await autoUpdater.downloadUpdate(dev))
                await autoUpdater.installUpdate();
        }
        provider.enabled = true;
        return true;
    }
    return false;
});

module.exports = (updater) => {
    autoUpdater = updater;
    return [checkUpdateCommand, installUpdateCommand];
};