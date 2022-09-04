const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const dbfuncs = require('../dbfuncs.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription('Delete one of your snap requests using its request id')
		.addIntegerOption(opt => opt.setName('reqid')
									.setDescription('Request id of the snap request to delete found using /show')
									.setRequired(true))
		.setDMPermission(false),

	async execute(interaction, { pwbChannel }) {
		if (pwbChannel === undefined) return interaction.reply({ content: 'Error: this command can only be used in a channel that is `/watch` activated', ephemeral: true })

		let reqID = interaction.options.getInteger('reqid');

		let reqObj = dbfuncs.getRequirement(reqID);
		if (reqObj === undefined || reqObj.discordchid !== interaction.channel.id)
			return interaction.reply('Error: not a valid snap request to delete');
		if (interaction.user.id !== reqObj.discordid && !dbfuncs.hasPermissions(interaction))
			return interaction.reply('Error: you do not have permission to delete someone else\'s snap request');

		let res = dbfuncs.deleteRequirement(reqID);
		if (!res) console.log('db error something about deleting snap request');
		return interaction.reply('Successfully deleted snap request');
	},
};