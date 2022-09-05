const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const budget = require('./budget.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('budgetfor')
		.setDescription('Sets the maximum snap price that the targeted user or role will get pinged for')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Sets the maximum snap price that the targeted user will get pinged for')
				.addUserOption(option => option.setName('target').setDescription('The user to set the budget of').setRequired(true))
				.addStringOption(opt =>
					opt
						.setName('maxprice')
						.setDescription('The maximum snap price that the targeted user will get pinged for. Put \'delete\' to remove the budget')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('role')
				.setDescription('Sets the maximum snap price that the targeted role will get pinged for')
				.addRoleOption(option => option.setName('target').setDescription('The role to set the budget of').setRequired(true))
				.addStringOption(opt =>
					opt
						.setName('maxprice')
						.setDescription('The maximum snap price that the targeted role will get pinged for. Put \'delete\' to remove the budget')
						.setRequired(true)))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageGuild |
									 PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageMessages)
		.setDMPermission(false),

	execute: budget.execute,
};