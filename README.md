# Discord Sync Commands

Easily keep your bot's slash commands synchronized with Discord! 🔁

## Features

⚡ No useless calls to the Discord API!  
❗ Auto detection of changes in your commands!  
🤟 Super easy to use!

## Example

```js
const Discord = require('discord.js');
const client = new Discord.Client({
    intents: []
});

const synchronizeSlashCommands = require('discord-sync-commands');
synchronizeSlashCommands(client, [
    {
        name: 'ping',
        description: 'Check whether the bot is working'
    }
], {
    debug: true,
    guildId: '558328638911545423' // remove this property to use global commands
});

client.on('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', (interaction) => {

    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        interaction.reply('Pong!');
    }

});

client.login('token');
```
