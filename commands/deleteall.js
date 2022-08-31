const { SlashCommandBuilder } = require('discord.js');
const dbfuncs = require('../dbfuncs.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deleteall')
		.setDescription('Deletes all of your snap requests in this channel')
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
	    let msg = res.reduce((accum, r) => {
	        let success = dbfuncs.deleteRequirement(r.reqID);
	        if(success) {
	            if(accum !== '') accum += '\n';
	            accum += `id: ${r.reqID} | ${r.message}`;
	        }
	        return accum;
	    }, '')
	    if(msg === '') return interaction.reply('No snap requests to delete');
	    else return interaction.reply('Deleted the following snap requests:\n```'+msg+'```');
	},
};