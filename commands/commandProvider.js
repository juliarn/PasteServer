const consoleReader = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

class CommandProvider {

    constructor(defaultCommand) {
        this.commands = {};
        this.commands[defaultCommand.name] = defaultCommand;
        this.defaultCommand = defaultCommand;

        consoleReader.on("line", input => this.handleConsoleLine(input));
    }

    registerCommands(commands) {
        commands.forEach(command => this.commands[command.name.toLowerCase()] = command);
    }

    handleConsoleLine(input) {
        const commandParts = input.trim().split(" ");
        if(commandParts.length > 0) {
            const command = this.commands[commandParts[0].toLowerCase()];
            if(command) {
                if (command.handler(commandParts.filter((value, index) => index > 0), this) === false)
                    console.log(`Wrong syntax. Use: ${command.syntax}`)
            } else
                console.log(`Command not found. Execute '${this.defaultCommand.name}' for a list of all commands`)
        }
    }

}

class Command {

    constructor(name, description, syntax, handler) {
        this.name = name;
        this.description = description;
        this.syntax = syntax;
        this.handler = handler;
    }

}

const helpCommand = new Command("help", "Shows all available commands.", "help",(args, provider) => {
    const commandMap = provider.commands;
    Object.keys(commandMap).forEach(key => {
        const command = commandMap[key];
        console.log(`${command.name} | ${command.description}`)
    });
    return true;
});

module.exports = {
    defaultCommand: helpCommand,
    CommandProvider,
    Command
};