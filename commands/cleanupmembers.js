const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const dbfuncs = require('../dbfuncs.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cleanupmembers')
		.setDescription('Removes the snap requests of any member that has left this guild')
		.setDefaultMemberPermissions(PermissionsBitField.Administrator | PermissionsBitField.ManageChannels | PermissionsBitField.ManageGuild |
									 PermissionsBitField.ManageRoles | PermissionsBitField.ManageMessages)
		.setDMPermission(false),

	async execute(interaction, { pwbChannel }) {
		if (pwbChannel === undefined) return interaction.reply({ content: 'Error: this command can only be used in a channel that is `/watch` activated', ephemeral: true })
		if (!dbfuncs.hasPermission(interaction)) return interaction.reply({ content: 'Error: you do not have the relevant permission to use this command', ephemeral: true })

		let discokids = dbfuncs.listDiscokids(interaction.guild.id);
		let waitTime = Math.min(Math.max(discokids.length, 10), 1440);

		if(isSpamming('cleanupmembers', interaction.guild.id, waitTime)) {
			return interaction.reply(`You must wait at least ${waitTime} minutes before using this command again.`);
		}

		let mypromises = [];
		let msg = `Going through ${discokids.length} members...`;
		await interaction.reply(msg);

		for(let dkid of discokids) {
			if(dkid.discordid === 'everyone') continue;

			mypromises.push(interaction.client.guilds.fetch(dkid.guildid).then(guild => {
				let mypromise;
				if(dkid.discordid.charAt(0) === '&')
					mypromise = guild.roles.fetch(dkid.discordid.slice(1));
				else
					mypromise = guild.members.fetch(dkid.discordid);
				return mypromise.catch(err => {
					switch(err.code) {
						case 500: // Connection error
							//console.log("Connection error");
							msg += '\nConnection error';
							interaction.editReply(msg);
							return;
						case 10007: // Unknown member
						case 10011: // Unknown role
						//case 50001: // Missing access
						case 50035: // Invalid string
							let changes = dbfuncs.deleteMember(dkid.discordid, dkid.guildid)
							let words = `Removed snaps requests for member ${dkid.discordid} in guild ${dkid.guildid}`;
							console.log(words);
							msg += `\n${words}`
							interaction.editReply(msg);
							return;
						default:
							console.log("Unknown error");
							console.log(dkid);
							console.log(err);
							msg += `\nUnknown error. Please check the logs. Id: ${+new Date()}`;
							interaction.editReply(msg);
					}
				});
			}).catch(err => {
				msg += `\nCould not fetch guild ${dkid.guildid} for discokid ${dkid.discordid}`
				interaction.editReply(msg);
			}));
		}
		Promise.all(mypromises).then(() => { msg+='\nDone'; interaction.editReply(msg); })
	},
};

let spamTracker = {};
/**
 * @param interval - minutes
 * @returns true if 
 */
function isSpamming(commandid, identifier, interval) {
	if(spamTracker[commandid] === undefined) {
		spamTracker[commandid] = { identifier: new Date() };
		return false;
	}
	let lastUsage = spamTracker[commandid][identifier];
	if(lastUsage === undefined) {
		spamTracker[commandid][identifier] = new Date();
		return false;
	} else if(((new Date() - lastUsage) / 60000) < interval) {
		return true;
	} else {
		spamTracker[commandid][identifier] = new Date();
		return false;
	}
}