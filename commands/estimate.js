const { SlashCommandBuilder } = require('discord.js');
const lists = require('../lists.js');
const parsefuncs = require('../parse.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('estimate')
		.setDescription('Estimate the exchange price of refined items given its base price')
		.addStringOption(opt => opt.setName('base_price')
								   .setDescription('Enter the base price of the item you want estimated')
								   .setRequired(true))
		.addIntegerOption(opt => opt.setName('refine')
									.setDescription('Enter the target refine level of the item you want estimated')
									.setRequired(true)),

	async execute(interaction) {
		let base_price = interaction.options.getString('base_price');
		const refine = interaction.options.getInteger('refine');

    	if(refine < 0 || refine > 15) return interaction.reply('Error: `refine` is out of range 0-15');
    	base_price = parsefuncs.parseVerboseNumber(base_price);
    	if(isNaN(base_price)) return interaction.reply('Error: `base_price` could not be parsed');
    	if(base_price < 0 || base_price > 999999999) return interaction.reply('Error: `base_price` is out of allowed range');

		return interaction.reply('The estimated exchange price for your +'+refine+' item is '+lists.refineprice[refine](base_price).toLocaleString());
	},
};