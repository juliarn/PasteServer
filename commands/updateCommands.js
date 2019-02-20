const {Command} = require("./commands");
let autoUpdater;

const checkUpdateCommand = new Command("checkUpdate", "Checks for updates of the PasteServer", "checkUpdate", async (args, provider) => {
    if(args.length === 0) {
        provider.enabled = false;
        await autoUpdater.checkForUpdates();
        provider.enabled = true;
        return true;
    }
    return false;
});

const installUpdateCommand = new Command("installUpdate", "Installs an update of the PasteServer, if available", "installUpdate", async (args, provider) => {
    if(args.length === 0) {
        provider.enabled = false;
        if(await autoUpdater.checkForUpdates()) {
            if (await autoUpdater.downloadUpdate())
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