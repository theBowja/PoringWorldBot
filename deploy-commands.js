// registers slash commands for discord

const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const config = require('./config.js');
const { clientId, guildId } = require('./config.js');
const { token } = require('./auth.json');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
 	.catch(console.error);

// DELETING COMMANDS
// // for global commands
// rest.put(Routes.applicationCommands(clientId), { body: [] })
// 	.then(() => console.log('Successfully deleted all application commands.'))
// 	.catch(console.error);