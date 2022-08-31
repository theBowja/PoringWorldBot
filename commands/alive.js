const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('alive')
		.setDescription('Check if the bot is alive'),
		
	async execute(interaction) {
		return interaction.reply('🙂');
	},
};