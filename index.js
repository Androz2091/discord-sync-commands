const { Client, RESTJSONErrorCodes, ApplicationCommand, Events } = require('discord.js');

/**
 * Discord slash commands synchronization utility
 * @param {Client} client - Discord.js client instance
 * @param {Array<Object>} commands - Array of command objects to synchronize
 * @param {Object} options - Configuration options
 * @param {boolean} [options.debug=false] - Enable debug logging
 * @param {string|null} [options.guildId=null] - Guild ID for guild-specific commands (null for global commands)
 * @returns {Promise<Object>} Synchronization results with counts
 * @throws {TypeError} When client is not a Client instance or commands is not an array
 * @throws {Error} When client application is not available
 * @example
 * const syncCommands = require('discord-sync-commands');
 * 
 * const commands = [
 *   {
 *     name: 'ping',
 *     description: 'Replies with Pong!',
 *     type: ApplicationCommandType.ChatInput
 *   }
 * ];
 * 
 * const result = await syncCommands(client, commands, { debug: true });
 * console.log(`Created: ${result.newCommandCount}, Updated: ${result.updatedCommandCount}`);
 */
module.exports = async (client, commands, options = {
    debug: false,
    guildId: null
}) => {
    if (!(client instanceof Client)) {
        throw new TypeError('Client instance is required');
    };

    if (!Array.isArray(commands)) {
        throw new TypeError('Commands must be an array');
    };

    /**
     * Debug logging function
     * @param {string} message - Message to log if debug is enabled
     */
    const log = (message) => options.debug && console.log(`[discord-sync-commands] ${message}`);

    try {
        /**
         * Wait for client to be ready if not already ready
         */
        const ready = client.isReady() ? Promise.resolve() : new Promise(resolve => client.once(Events.ClientReady, resolve));
        await ready;


        /**
         * Fetch existing commands from Discord API
         * @type {Collection<string, ApplicationCommand>}
         */
        const currentCommands = await client.application.commands
            .fetch(options.guildId ? { guildId: options.guildId } : {})
            .catch(err => {
                if (err.code === RESTJSONErrorCodes.MissingAccess) {
                    throw new Error('The client does not have the "applications.commands" scope authorized.');
                }
                throw err;

        log(`Synchronizing commands...`);
        log(`Currently ${currentCommands.size} commands registered.`);

        /**
         * Find commands that need to be created (exist in local but not in Discord)
         * @type {Array<Object>}
         */
        const newCommands = commands.filter((command) => !currentCommands.some((c) => c.name === command.name));
        let createdCount = 0;
        
        for (const newCommand of newCommands) {
            try {
                await client.application.commands.create(newCommand, options.guildId);
                createdCount++;
                log(`Created command: ${newCommand.name}`);
            } catch (error) {
                log(`Error creating command ${newCommand.name}: ${error.message}`);
            }
        }

        log(`Created ${createdCount} new commands!`);

        /**
         * Find commands that need to be deleted (exist in Discord but not in local)
         * @type {Collection<string, ApplicationCommand>}
         */
        const deletedCommands = currentCommands.filter((command) => !commands.some((c) => c.name === command.name));
        let deletedCount = 0;
        
        for (const deletedCommand of deletedCommands.values()) {
            try {
                await deletedCommand.delete();
                deletedCount++;
                log(`Deleted command: ${deletedCommand.name}`);
            } catch (error) {
                log(`Error deleting command ${deletedCommand.name}: ${error.message}`);
            }
        }

        log(`Deleted ${deletedCount} obsolete commands!`);

        /**
         * Find commands that need to be updated (exist in both but with differences)
         * @type {Array<Object>}
         */
        const updatedCommands = commands.filter((command) => currentCommands.some((c) => c.name === command.name));
        let updatedCommandCount = 0;
        
        for (const updatedCommand of updatedCommands) {
            try {
                const previousCommand = currentCommands.find((c) => c.name === updatedCommand.name);
                
                if (isCommandModified(previousCommand, updatedCommand)) {
                    await previousCommand.edit(updatedCommand);
                    updatedCommandCount++;
                    log(`Updated command: ${updatedCommand.name}`);
                }
            } catch (error) {
                log(`Error updating command ${updatedCommand.name}: ${error.message}`);
            }
        }

        log(`Updated ${updatedCommandCount} commands!`);
        log(`Command synchronization completed successfully!`);

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

/**
 * Check if a command has been modified by comparing all relevant properties
 * @param {ApplicationCommand} previousCommand - The existing command from Discord
 * @param {Object} newCommand - The new command definition
 * @returns {boolean} True if the command needs to be updated
 */
function isCommandModified(previousCommand, newCommand) {
    if (previousCommand.description !== newCommand.description) return true;
    if (previousCommand.defaultMemberPermissions !== newCommand.defaultMemberPermissions) return true;
    if (previousCommand.nsfw !== newCommand.nsfw) return true;
    
    // Use Discord.js built-in optionsEqual method for more reliable comparison
    return !ApplicationCommand.optionsEqual(previousCommand.options ?? [], newCommand.options ?? []);
}


