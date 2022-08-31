const { SlashCommandBuilder } = require('discord.js');
const dbfuncs = require('../dbfuncs.js');
const parsefuncs = require('../parse.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('budget')
		.setDescription('Sets the maximum snap price that you will get pinged for')
		.addStringOption(opt => opt.setName('maxprice')
								   .setDescription('The maximum snap price that you will get pinged for. Put \'delete\' to remove your budget')
								   .setRequired(true))
		.setDMPermission(false),

	async execute(interaction, { pwbChannel }) {
		if (pwbChannel === undefined) return interaction.reply({ content: 'Error: this command can only be used in a channel that is `/watch` activated', ephemeral: true })

		let targetID = interaction.user.id;

	    // check if a user/role is targeted
		const option = interaction.options.get('target');
		if (option && option.value) {
			targetID = (option.role ? '&' : '')+option.value;
			if (option.role && value === option.role.guild.id) targetID = 'everyone';
		}

		let pwbTarget = dbfuncs.getDiscokid(targetID, interaction.guild.id);
	    if(pwbTarget === undefined) // if target doesn't exist in our database, set defaults
	        pwbTarget = { discordid: targetID };
	    if(pwbTarget.dkidID === undefined) // if target doesn't exist in our database, create it
	        pwbTarget.dkidID = dbfuncs.addDiscokid(pwbTarget.discordid, interaction.guild.id);

		let maxprice = interaction.options.getString('maxprice').toLowerCase();

		// check if delete the budget for the target
		if (maxprice === '-' || maxprice === 'delete' || maxprice === 'del') {
	        let result = dbfuncs.setBudget(pwbTarget.dkidID, pwbChannel.chID);
	        return interaction.reply(`${result ? 'Successfully deleted budget' : "Error: failed to delete budget" + targetID !== undefined ? ' of target' : ''}`);
		}

		maxprice = parsefuncs.parseVerboseNumber(maxprice);
	    if (isNaN(maxprice)) return interaction.reply("Error: not a valid number");

        let result = dbfuncs.setBudget(pwbTarget.dkidID, pwbChannel.chID, maxprice);
	    if (result) return interaction.reply(`Successfully set budget ${targetID !== undefined ? 'of target ' : ''}to ${maxprice.toLocaleString()}`);
	    else return interaction.reply("Error: database error");
	},
};