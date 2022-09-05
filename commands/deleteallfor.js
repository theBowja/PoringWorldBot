const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const deleteall = require('./deleteall.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deleteallfor')
		.setDescription('Deletes all snap requests of the target user or role in this channel')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Deletes all snap requests of the target user in this channel')
				.addUserOption(option => option.setName('target').setDescription('The user to delete all the snap requests of').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('role')
				.setDescription('Deletes all snap requests of the target role in this channel')
				.addRoleOption(option => option.setName('target').setDescription('The role to delete all the snap requests of').setRequired(true)))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageGuild |
									 PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageMessages)
		.setDMPermission(false),


	execute: deleteall.execute,
};