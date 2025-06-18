const Discord = require('discord.js');

module.exports = async (client, commands, options = {
    debug: false,
    guildId: null
}) => {
    const log = (message) => options.debug && console.log(message);

    try {
        const ready = client.isReady() ? Promise.resolve() : new Promise(resolve => client.once('ready', resolve));
        await ready;


        const currentCommands = await client.application.commands.fetch(
            options.guildId ? { guildId: options.guildId } : {}
        );

        log(`Synchronizing commands...`);
        log(`Currently ${currentCommands.size} commands.`);

        const newCommands = commands.filter((command) => !currentCommands.some((c) => c.name === command.name));
        let createdCount = 0;
        for (let newCommand of newCommands) {
            try {
                await client.application.commands.create(newCommand, options.guildId);
                createdCount++;
            } catch (error) {
                log(`Error creating command ${newCommand.name}: ${error.message}`);
            }
        }

        log(`Created ${createdCount} commands!`);

        const deletedCommands = currentCommands.filter((command) => !commands.some((c) => c.name === command.name));
        let deletedCount = 0;
        for (let deletedCommand of deletedCommands.values()) {
            try {
                await deletedCommand.delete();
                deletedCount++;
            } catch (error) {
                log(`Error deleting command ${deletedCommand.name}: ${error.message}`);
            }
        }

        log(`Deleted ${deletedCount} commands!`);

        const updatedCommands = commands.filter((command) => currentCommands.some((c) => c.name === command.name));
        let updatedCommandCount = 0;
        for (let updatedCommand of updatedCommands) {
            try {
                const newCommand = updatedCommand;
                const previousCommand = currentCommands.find((c) => c.name === updatedCommand.name);
                let modified = false;

                if (previousCommand.description !== newCommand.description) modified = true;

                if (!compareOptions(previousCommand.options ?? [], newCommand.options ?? [])) modified = true;

                if (modified) {
                    await previousCommand.edit(newCommand);
                    updatedCommandCount++;
                }
            } catch (error) {
                log(`Error updating command ${updatedCommand.name}: ${error.message}`);
            }
        }

        log(`Updated ${updatedCommandCount} commands!`);
        log(`Commands synchronized!`);

        return {
            currentCommandCount: currentCommands.size,
            newCommandCount: createdCount,
            deletedCommandCount: deletedCount,
            updatedCommandCount
        };

    } catch (error) {
        log(`Error during command synchronization: ${error.message}`);
        throw error;
    }
};

function compareOptions(existingOptions, newOptions) {
    if (existingOptions.length !== newOptions.length) return false;

    for (let i = 0; i < existingOptions.length; i++) {
        const existing = existingOptions[i];
        const newOpt = newOptions[i];

        if (existing.name !== newOpt.name) return false;
        if (existing.description !== newOpt.description) return false;
        if (existing.type !== newOpt.type) return false;
        if ((existing.required ?? false) !== (newOpt.required ?? false)) return false;

        if (existing.choices && newOpt.choices) {
            if (!compareChoices(existing.choices, newOpt.choices)) return false;
        } else if (existing.choices || newOpt.choices) {
            return false;
        }

        if (existing.options && newOpt.options) {
            if (!compareOptions(existing.options, newOpt.options)) return false;
        } else if (existing.options || newOpt.options) {
            return false;
        }
    }

    return true;
}

function compareChoices(existingChoices, newChoices) {
    if (existingChoices.length !== newChoices.length) return false;

    for (let i = 0; i < existingChoices.length; i++) {
        const existing = existingChoices[i];
        const newChoice = newChoices[i];

        if (existing.name !== newChoice.name) return false;
        if (existing.value !== newChoice.value) return false;
    }

    return true;
}
