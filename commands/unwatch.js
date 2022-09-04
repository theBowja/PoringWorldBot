const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const dbfuncs = require('../dbfuncs.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unwatch')
		.setDescription('Remove\'s this channel from bot watch and delete all snap requests in it')
		.setDefaultMemberPermissions(PermissionsBitField.Administrator | PermissionsBitField.ManageChannels | PermissionsBitField.ManageGuild |
									 PermissionsBitField.ManageRoles | PermissionsBitField.ManageMessages)
		.setDMPermission(false),

	async execute(interaction, { pwbChannel }) {
		if (pwbChannel === undefined) return interaction.reply({ content: 'Error: this command can only be used in a channel that is `/watch` activated', ephemeral: true })
		if (!dbfuncs.hasPermission(interaction)) return interaction.reply({ content: 'Error: you do not have the relevant permission to use this command', ephemeral: true })

		const res = dbfuncs.deleteChannel(interaction.channelId);
	    if(res) return interaction.reply('Removed this channel from bot watch and deleted all snap requests in it');
	    else return interaction.reply('Error: database error');
	},
};