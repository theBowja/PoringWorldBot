const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const show = require('./show.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showfor')
		.setDescription('Shows the information and all snap requests of the targeted user or role for this channel')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Shows the information and all snap requests of the targeted user for this channel')
				.addUserOption(option => option.setName('target').setDescription('The user to get the snap requests of').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('role')
				.setDescription('Shows the information and all snap requests of the targeted role for this channel')
				.addRoleOption(option => option.setName('target').setDescription('The role to get the snap requests of').setRequired(true)))
		.setDMPermission(false),

	execute: show.execute
};

