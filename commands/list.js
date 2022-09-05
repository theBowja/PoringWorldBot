const { SlashCommandBuilder } = require('discord.js');
const show = require('./show.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Shows your information and all snap requests you have in this channel')
		.setDMPermission(false),

	execute: show.execute
};