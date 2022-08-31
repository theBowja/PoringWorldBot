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
			if (option.role && value === option.role.guild.id) targetID = 'everyone';
		}

	    let res = dbfuncs.listUserRequirements(targetID, interaction.guild.id, interaction.channel.id);
	    let msg = res.map((r) => { return `id: ${r.reqID} | ${r.message}`; }).join('\n');
	    return interaction.reply(msg === '' ? '0 reqs' : 'use "/delete" to delete snap requests\n```'+msg+'```');
	},
};