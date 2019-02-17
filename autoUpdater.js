const config = require("./config");
const request = require("request");
const fs = require("fs-extra");
const path = require("path");
const unzip = require("unzip");

class AutoUpdater {

    constructor() {
        this.updateFileName = "PasteServer-update.zip";
    }

    checkForUpdates(currentVersion) {
        console.log("Checking for updates ...");
        return new Promise(resolve => {
            request(config.autoUpdate.packageJsonURL, {json: true}, (error, response, body) => {
                if(error) {
                    console.error("Error while checking for updates", error);
                    resolve(false);
                    return;
                }

                const newestVersion = body.version;
                if(newestVersion !== currentVersion) {
                    console.log(`There's a newer version of the PasteServer available (${newestVersion})!`);
                    if(!config.autoUpdate.enabled)
                        console.log("Enable 'autoUpdate' in the config to download it!");
                    resolve(true);
                } else
                    resolve(false);
            });
        });
    }

    downloadUpdate() {
        console.log("Downloading update ...");
        return new Promise(resolve => {
            if(!fs.existsSync(".update"))
                fs.mkdirSync(".update");
            request(config.autoUpdate.zipURL).on("error", error => {
                console.error("Error while downloading update", error);
                resolve(false);
            }).pipe(fs.createWriteStream(path.resolve(".update", this.updateFileName))).on("close", () => {
                console.log("Successfully downloaded update!");
                resolve(true);
            });
        });
    }

    installUpdate() {
        console.log("Installing update ...");
        let contentFolderName = "";
        return new Promise(resolve => {
            fs.createReadStream(path.resolve(".update", this.updateFileName))
                .pipe(unzip.Parse()).on("entry", entry => {
                    const isDir = entry.type === "Directory";
                    if(!contentFolderName && isDir)
                        contentFolderName = entry.path;
                    const fileName = entry.path.replace(contentFolderName, "");
                    if (fileName && !config.autoUpdate.keepFilesOrDirs.includes(fileName)) {
                        const filePath = path.resolve(fileName);
                        if(!fs.existsSync(filePath)) {
                            if(isDir)
                                fs.mkdirSync(filePath);
                            else
                                fs.writeFileSync(filePath, "");
                        }
                        if(!isDir) {
                            console.log("Replacing " + fileName);
                            entry.pipe(fs.createWriteStream(filePath));
                        }
                    } else
                        entry.autodrain();
                }).on("error", error => {
                    console.error("Error while installing update", error);
                    resolve();
                }).on("close", () => {
                    console.log("Successfully installed update!");
                    console.log("Stopping the PasteServer for the update to be usable ...")
                    process.exit();
                });
            fs.removeSync(".update");
        });
    }

}

module.exports = new AutoUpdater();