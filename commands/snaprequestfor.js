const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const snaprequest = require('./snaprequest.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snaprequestfor')
		.setDescription('Creates a snap request for a user or role')
		.addSubcommand(subcommand =>
			snaprequest.addOptions(subcommand
				.setName('user')
				.setDescription('Creates a snap request for a user')
				.addUserOption(option => option.setName('assign').setDescription('The user for this snap request').setRequired(true))))
		.addSubcommand(subcommand =>
			snaprequest.addOptions(subcommand
				.setName('role')
				.setDescription('Creates a snap request for a role')
				.addRoleOption(option => option.setName('assign').setDescription('The role for this snap request').setRequired(true))))
		.setDefaultMemberPermissions(PermissionsBitField.Administrator | PermissionsBitField.ManageChannels | PermissionsBitField.ManageGuild |
									 PermissionsBitField.ManageRoles | PermissionsBitField.ManageMessages)
		.setDMPermission(false),

	autocomplete: snaprequest.autocomplete,

	execute: snaprequest.execute
};