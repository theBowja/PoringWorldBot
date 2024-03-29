const { SlashCommandBuilder } = require('discord.js');
const dbfuncs = require('../dbfuncs.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Shows your information and all snap requests you have in this channel')
		.setDMPermission(false),

	async execute(interaction, { pwbChannel }) {
		if (pwbChannel === undefined) return interaction.reply({ content: 'Error: this command can only be used in a channel that is `/watch` activated', ephemeral: true })

	    let targetID = interaction.user.id;

	    // check if a user/role is targeted
		const option = interaction.options.get('target');
		if (option && option.value) {
			targetID = (option.role ? '&' : '')+option.value;
			if (option.role && option.value === option.role.guild.id) targetID = 'everyone';
		}

		// get budget
		const budget = dbfuncs.getBudgetSimple(targetID, interaction.channel.id);

	    let res = dbfuncs.listUserRequirements(targetID, interaction.guild.id, interaction.channel.id);
	    let msg = res.map((r) => { return `id: ${r.reqID} | ${r.message}`; }).join('\n');

	    let finalmsg = '';
	    if (budget !== -1) finalmsg += `budget is set to: ${budget.toLocaleString()}\n`;
	    finalmsg += msg === '' ? '0 reqs' : 'use "/delete" to delete snap requests\n```'+msg+'```';

	    return interaction.reply(finalmsg);
	},
};