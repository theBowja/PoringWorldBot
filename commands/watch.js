const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const dbfuncs = require('../dbfuncs.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('watch')
		.setDescription('Allow\'s the bot to start handling snapping requests on this channel')
		.setDefaultMemberPermissions(PermissionsBitField.Administrator | PermissionsBitField.ManageChannels | PermissionsBitField.ManageGuild)
		.setDMPermission(false),

	async execute(interaction) {
		if (!dbfuncs.hasPermission(interaction)) return interaction.reply({ content: 'Error: you do not have the relevant permission to use this command', ephemeral: true })
		const res = dbfuncs.addChannel(interaction.channelId, interaction.guildId);
		if(res !== -1) return interaction.reply('Now handling snapping requests in this channel');
		else return interaction.reply('Error: this channel is probably already under watch');
	},
};