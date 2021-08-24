const Discord = require('discord.js');

module.exports = async (client, commands, debug) => {

    const log = (message) => debug && console.log(message);

    const ready = client.readyAt ? Promise.resolve() : new Promise(resolve => client.once('ready', resolve));
    await ready;
    await client.application.commands.fetch();

    log(`Synchronizing commands...`);
    log(`Currently ${client.application.commands.cache.size} commands.`);

    const newCommands = commands.filter((command) => !client.application.commands.cache.some((c) => c.name === command.name));
    for (let newCommand of newCommands) {
        await client.application.commands.create(newCommand);
    }

    log(`Created ${newCommands.length} commands!`);

    const deletedCommands = client.application.commands.cache.filter((command) => !commands.some((c) => c.name === command.name)).toJSON();
    for (let deletedCommand of deletedCommands) {
        await deletedCommand.delete();
    }

    log(`Deleted ${deletedCommands.length} commands!`);

    const updatedCommands = commands.filter((command) => client.application.commands.cache.some((c) => c.name === command.name));
    let updatedCommandCount = 0;
    for (let updatedCommand of updatedCommands) {
        const newCommand = updatedCommand;
        const previousCommand = client.application.commands.cache.find((c) => c.name === updatedCommand.name);
        let modified = false;
        if (previousCommand.description !== newCommand.description) modified = true;
        if (!Discord.ApplicationCommand.optionsEqual(previousCommand.options ?? [], newCommand.options ?? [])) modified = true;
        if (modified) {
            await previousCommand.edit(newCommand);
            updatedCommandCount++;
        }
    }

    log(`Updated ${updatedCommandCount} commands!`);

    log(`Commands synchronized!`);

};
