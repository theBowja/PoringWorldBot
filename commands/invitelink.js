const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invitelink')
		.setDescription('Gives the invite link for this bot'),
		
	async execute(interaction) {
		return interaction.reply('https://discordapp.com/oauth2/authorize?client_id='+interaction.client.user.id+'&permissions=149504&scope=applications.commands%20bot');
	},
};