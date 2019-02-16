const config = require("/config");
const request = require("request");

module.exports = {

    checkForUpdates: (currentVersion) => {
        return new Promise(resolve => {
            request(config.autoUpdate.packageJsonLink, {json: true}, (error, response, body) => {
                if(error) {
                    console.error("Error while checking for a newer version", error);
                    resolve(false);
                    return;
                }

                const newestVersion = body.version;
                if(newestVersion !== currentVersion) {
                    console.log("There's a newer version of the PasteServer available! Enable 'autoUpdate' in the config to download it!");
                    resolve(true);
                } else
                    resolve(false);
            });
        });
    },

    downloadUpdate: () => {
        // TODO
    }

};