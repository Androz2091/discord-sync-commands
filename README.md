# Discord Sync Commands

A Discord.js v14.20.0 compatible slash command synchronization utility that automatically keeps your bot's slash commands synchronized with Discord.

## ✨ Features

- ✅ **Smart Synchronization**: Only updates commands that have actually changed
- 🔄 **Automatic CRUD**: Automatically creates, updates, and deletes commands
- 🎯 **Guild & Global**: Supports both guild-specific and global commands
- 🔍 **Comprehensive Comparison**: Uses Discord.js built-in `ApplicationCommand.optionsEqual()` method
- 📊 **Detailed Logging**: Debug mode with detailed operation logs
- 🛡️ **Safe**: Robust error handling and validation
- 🏗️ **Modern**: Discord.js v14.20.0 compatible with ES6+ syntax

## 📦 Installation

```bash
npm install discord-sync-commands
```

## 🚀 Usage

### Basic Usage

```javascript
const { Client, GatewayIntentBits, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const syncCommands = require('discord-sync-commands');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
        type: ApplicationCommandType.ChatInput
    },
    {
        name: 'echo',
        description: 'Echo back a message',
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: 'message',
                description: 'Message to echo',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    }
];

client.once('ready', async () => {
    console.log('Bot is ready!');
    
    // Synchronize commands
    const result = await syncCommands(client, commands, {
        debug: true // Enable debug logging
    });
    
    console.log(`${result.newCommandCount} commands created`);
    console.log(`${result.updatedCommandCount} commands updated`);
    console.log(`${result.deletedCommandCount} commands deleted`);
});

client.login('YOUR_BOT_TOKEN');
```

### Using SlashCommandBuilder

You can also use Discord.js SlashCommandBuilder for cleaner code:

```javascript
const { Client, GatewayIntentBits, SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const syncCommands = require('discord-sync-commands');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Using SlashCommandBuilder for better type safety and cleaner syntax
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .toJSON(),
        
    new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Echo back a message')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to echo back')
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(2000)
        )
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the message to')
                .setRequired(false)
        )
        .toJSON(),
        
    new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Get information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to get info about')
                .setRequired(false)
        )
        .toJSON(),
        
    // Context Menu Commands
    new ContextMenuCommandBuilder()
        .setName('Get User Avatar')
        .setType(ApplicationCommandType.User)
        .toJSON(),
        
    new ContextMenuCommandBuilder()
        .setName('Quote Message')
        .setType(ApplicationCommandType.Message)
        .toJSON()
];

client.once('ready', async () => {
    console.log('Bot is ready!');
    
    const result = await syncCommands(client, commands, {
        debug: true
    });
    
    console.log(`Commands synchronized: ${result.newCommandCount} created, ${result.updatedCommandCount} updated`);
});

client.login('YOUR_BOT_TOKEN');
```

### Guild-Specific Commands

```javascript
// Commands that only work in a specific guild
await syncCommands(client, commands, {
    debug: true,
    guildId: 'YOUR_GUILD_ID'
});
```

### Advanced Command Examples

#### Traditional Object Syntax

```javascript
const { PermissionFlagsBits } = require('discord.js');

const advancedCommands = [
    {
        name: 'admin',
        description: 'Admin commands',
        type: ApplicationCommandType.ChatInput,
        defaultMemberPermissions: PermissionFlagsBits.Administrator,
        dmPermission: false,
        nsfw: false,
        options: [
            {
                name: 'action',
                description: 'Action to perform',
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true,
                choices: [
                    { name: 'Ban User', value: 'ban' },
                    { name: 'Clear Messages', value: 'clear' }
                ]
            },
            {
                name: 'reason',
                description: 'Reason for the action',
                type: ApplicationCommandOptionType.String,
                required: false,
                minLength: 3,
                maxLength: 200
            }
        ]
    }
];
```

#### SlashCommandBuilder Syntax

```javascript
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const advancedCommands = [
    // Admin command with permissions and choices
    new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action to perform')
                .setRequired(true)
                .setAutocomplete(true)
                .addChoices(
                    { name: 'Ban User', value: 'ban' },
                    { name: 'Clear Messages', value: 'clear' },
                    { name: 'Kick User', value: 'kick' },
                    { name: 'Timeout User', value: 'timeout' }
                )
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the action')
                .setRequired(false)
                .setMinLength(3)
                .setMaxLength(200)
        )
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Target user for the action')
                .setRequired(false)
        )
        .toJSON(),

    // Math command with number constraints
    new SlashCommandBuilder()
        .setName('math')
        .setDescription('Perform mathematical operations')
        .addStringOption(option =>
            option.setName('operation')
                .setDescription('Mathematical operation')
                .setRequired(true)
                .addChoices(
                    { name: 'Add (+)', value: 'add' },
                    { name: 'Subtract (-)', value: 'subtract' },
                    { name: 'Multiply (×)', value: 'multiply' },
                    { name: 'Divide (÷)', value: 'divide' },
                    { name: 'Power (^)', value: 'power' },
                    { name: 'Square Root (√)', value: 'sqrt' }
                )
        )
        .addNumberOption(option =>
            option.setName('number1')
                .setDescription('First number')
                .setRequired(true)
                .setMinValue(-1000000)
                .setMaxValue(1000000)
        )
        .addNumberOption(option =>
            option.setName('number2')
                .setDescription('Second number (not needed for square root)')
                .setRequired(false)
                .setMinValue(-1000000)
                .setMaxValue(1000000)
        )
        .toJSON(),

    // Complex command with subcommands
    new SlashCommandBuilder()
        .setName('server')
        .setDescription('Server management commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get server information')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('channels')
                .setDescription('Manage server channels')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Channel action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'List All', value: 'list' },
                            { name: 'Create New', value: 'create' },
                            { name: 'Delete', value: 'delete' }
                        )
                )
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Target channel')
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
                )
        )
        .addSubcommandGroup(group =>
            group
                .setName('roles')
                .setDescription('Role management')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('create')
                        .setDescription('Create a new role')
                        .addStringOption(option =>
                            option.setName('name')
                                .setDescription('Role name')
                                .setRequired(true)
                                .setMinLength(1)
                                .setMaxLength(100)
                        )
                        .addStringOption(option =>
                            option.setName('color')
                                .setDescription('Role color (hex format)')
                                .setRequired(false)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('assign')
                        .setDescription('Assign role to user')
                        .addUserOption(option =>
                            option.setName('user')
                                .setDescription('User to assign role to')
                                .setRequired(true)
                        )
                        .addRoleOption(option =>
                            option.setName('role')
                                .setDescription('Role to assign')
                                .setRequired(true)
                        )
                )
        )
        .toJSON(),

    // NSFW command example
    new SlashCommandBuilder()
        .setName('nsfw-content')
        .setDescription('Age-restricted content command')
        .setNSFW(true)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of content')
                .setRequired(true)
                .addChoices(
                    { name: 'Image', value: 'image' },
                    { name: 'Video', value: 'video' },
                    { name: 'Text', value: 'text' }
                )
        )
        .toJSON()
];
```

## 📚 API Reference

### syncCommands(client, commands, options)

Synchronizes commands with Discord.

#### Parameters

- `client` (Client): Discord.js Client instance
- `commands` (Array): Array of command objects to synchronize
- `options` (Object): Optional configuration
  - `debug` (boolean): Enable debug logging (default: false)
  - `guildId` (string|null): Guild ID for guild-specific commands (default: null - global commands)

#### Returns

Promise\<Object\>:
```javascript
{
    currentCommandCount: number,  // Current number of commands
    newCommandCount: number,      // Number of commands created
    deletedCommandCount: number,  // Number of commands deleted
    updatedCommandCount: number   // Number of commands updated
}
```

## 🔧 Supported Features

### Discord.js v14.20.0 Features

- ✅ **Application Command Types**: ChatInput, User, Message
- ✅ **Option Types**: String, Integer, Boolean, User, Channel, Role, Mentionable, Number, Attachment
- ✅ **Permissions**: defaultMemberPermissions, dmPermission
- ✅ **NSFW**: Age-restricted commands
- ✅ **Autocomplete**: Dynamic option suggestions
- ✅ **Choices**: Predefined option values
- ✅ **Subcommands**: Nested command structure
- ✅ **Localizations**: Multi-language support
- ✅ **Constraints**: minValue, maxValue, minLength, maxLength
- ✅ **Channel Types**: Specific channel type restrictions

### Comparison Features

The module detects changes in:
- 📝 Command description
- ⚙️ Options (recursive comparison using Discord.js built-in method)
- 🔐 Permissions
- 🔞 NSFW status
- 🌍 Localizations

## 🏗️ Technical Details

### Built-in Discord.js Integration

This module leverages Discord.js's official `ApplicationCommand.optionsEqual()` method for reliable option comparison, ensuring compatibility with Discord's API specifications.

```javascript
// Uses Discord.js built-in method for accurate comparison
return !ApplicationCommand.optionsEqual(previousCommand.options ?? [], newCommand.options ?? []);
```

### Modern Event Handling

Uses Discord.js v14 event constants for better type safety:

```javascript
const { Events } = require('discord.js');
client.once(Events.ClientReady, () => {
    // Bot is ready
});
```

## 🛠️ Development

### Project Structure

```
discord-sync-commands/
├── index.js          # Main module
├── package.json      # Package information
└── README.md         # Documentation
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Discord.js Guide](https://discordjs.guide/)
- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [ApplicationCommand.optionsEqual() Documentation](https://discord.js.org/docs/packages/discord.js/14.20.0/ApplicationCommand:Class#optionsEqual)

## ⚠️ Important Notes

- Your bot must have the **applications.commands** scope
- Global commands can take up to 1 hour to propagate on Discord
- Guild commands are active immediately
- Be mindful of rate limits (200 global command limit)

## 🆘 Troubleshooting

### Common Errors

**"Missing applications.commands scope"**
```javascript
// Add &scope=applications.commands to your bot invitation URL
// Example: https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID&scope=bot%20applications.commands&permissions=0
```

**"Commands not updating"**
- Global commands can take up to 1 hour to propagate
- Try testing with guild commands first
- Enable debug mode to check logs

**"RESTJSONErrorCodes.MissingAccess"**
- Ensure your bot has the correct permissions
- Verify the bot is in the guild for guild-specific commands
- Check that the client application is properly initialized

## 📊 Performance

- ⚡ **Fast**: Only updates changed commands
- 🔄 **Efficient**: Uses Discord.js's built-in comparison methods
- 💾 **Lightweight**: Minimal dependencies
- 🛡️ **Reliable**: Comprehensive error handling and validation

## 🔄 What's New in v14.20.0 Compatibility

- 🆕 **Enhanced Option Comparison**: Now uses `ApplicationCommand.optionsEqual()` for more accurate comparison
- 🆕 **Modern Event Handling**: Uses `Events.ClientReady` constant
- 🆕 **Improved Error Handling**: Better error messages with `RESTJSONErrorCodes`
- 🆕 **Comprehensive JSDoc**: Full documentation with TypeScript-style annotations
- 🆕 **Optimized Performance**: Removed custom comparison functions in favor of Discord.js built-ins
