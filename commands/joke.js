const { SlashCommandBuilder } = require('discord.js');
const lists = require('../lists.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('joke')
		.setDescription('Funny joke'),
		
	async execute(interaction) {
		return interaction.reply(lists.joke[Math.floor(Math.random() * lists.joke.length)]);
	},
};