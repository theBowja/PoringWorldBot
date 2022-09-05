const { SlashCommandBuilder } = require('discord.js');
const dbfuncs = require('../dbfuncs.js');
const lists = require('../lists.js');
const parsefuncs = require('../parse.js');
const config = require('../config.js');
const fuzzysort = require('fuzzysort');

const parameters = ['itemname', 'enchant', 'enchantlevel', 'refine', 'slotted', 'broken', 'alias', 'category', 'pricehigher', 'pricelower', 'stock', 'assign'];

function addOptions(command) {
	command
		.addStringOption(opt => opt.setName('itemname')
								   .setDescription('Exact name match only. Asterick * substitutes for ★. Punctuation doesn\'t matter'))
		.addStringOption(opt => opt.setName('enchant')
								   .setDescription('What enchant the item has')
								   .addChoices(...lists.enchantV2.map( enchant => ({ name: enchant, value: enchant }) )) )
		.addStringOption(opt => opt.setName('enchantlevel')
								   .setDescription('Comma-separated list of integers or hyphenated ranges between 0 and 4'))
		.addStringOption(opt => opt.setName('refine')
								   .setDescription('Comma-separated list of integers or hyphenated ranges between 0 and 15'))
		.addBooleanOption(opt => opt.setName('slotted')
									.setDescription('Set to `True` if you only want slotted items'))
		.addBooleanOption(opt => opt.setName('broken')
									.setDescription('Set to `True` if you only want broken items'))
		.addBooleanOption(opt => opt.setName('alias')
									.setDescription('Set to `True` will allow you to also get pinged for snaps across equipment upgrades'))
		.addStringOption(opt => opt.setName('category')
								   .setDescription('Item categories')
								   .setAutocomplete(true))
		.addStringOption(opt => opt.setName('pricehigher')
								   .setDescription('Notifies you for snap price\'s higher than or equal to this'))
		.addStringOption(opt => opt.setName('pricelower')
								   .setDescription('Notifies you for snap price\'s lower than or equal to this'))
		.addIntegerOption(opt => opt.setName('stock')
									.setDescription('Notifies when number of stock of snap matches this number or higher'))
	return command;
}

module.exports = {
	data: addOptions(new SlashCommandBuilder())
		.setName('snaprequest')
		.setDescription('Creates a snap request for yourself')
		.setDMPermission(false),

	addOptions: addOptions,

	autocomplete: {
		category: {
			all: [...new Set(lists.categoryV2.concat(lists.categoryShort))],
			initial: lists.categoryShort
		}
	},

	async execute(interaction, { pwbChannel }) {
		if (pwbChannel === undefined) return interaction.reply({ content: 'Error: this command can only be used in a channel that is `/watch` activated', ephemeral: true })

		let valuesObj = {}
		for (let param of parameters) {
			const val = parseOption(interaction, param);
			if (val !== undefined) valuesObj[param] = val;
		}
		// validate pricehigher/pricelower
		if (valuesObj.pricehigher && valuesObj.pricelower && valuesObj.pricelower < valuesObj.pricehigher)
			valuesObj.pricelower = undefined;

		valuesObj.message = valuesToString(valuesObj);
		if (valuesObj.message === '') return interaction.reply('Error: no valid options provided');

    	let targetObj = dbfuncs.getDiscokid(interaction.user.id, interaction.guild.id) ||  { discordid: interaction.user.id };

		if(valuesObj.assign !== undefined) { // handle if -assign
			if (!dbfuncs.hasPermission(interaction)) return interaction.reply({ content: 'Error: you do not have the relevant permission to use this command', ephemeral: true })
			if(!existsInGuild(interaction.guild, valuesObj.assign) && !parsefuncs.isSpecialMention(valuesObj.assign))
				return interaction.reply('Error: user or role doesn\'t exist');
			targetObj = dbfuncs.getDiscokid(valuesObj.assign, interaction.guild.id); // grab target user from database
			if(targetObj === undefined)
				targetObj = { discordid: valuesObj.assign };
			delete valuesObj.assign; // just in case dbfuncs.addRequirement() messes up
		}

		// if user doesn't exist in database, then add him
		if(targetObj.dkidID === undefined)
			targetObj.dkidID = dbfuncs.addDiscokid(targetObj.discordid, interaction.guild.id);
		else {
			let count = dbfuncs.listUserRequirements(targetObj.discordid, interaction.guild.id, interaction.channel.id).length;
			let mylimit = config.limitreqs;
			if(count >= mylimit) {
				return interaction.reply(`Error: cannot add more than ${mylimit} snap requests per user or role`);
			}
		}

		let info = dbfuncs.addRequirement(targetObj.dkidID, pwbChannel.chID, valuesObj);
		if(info.changes === 1) {
			return interaction.reply('```id: '+info.lastInsertRowid+' | '+valuesObj.message+'```');
		} else {
			throw 'db error couldn\'t add a snap request';
		}
	},
};

/**
 * Takes an idstring (might have & in front for role)
 *   and checks if there is a user or role in the guild
 * @returns true/false. false if it's a bot
 */
function existsInGuild(guild, idstring) {
	if (idstring === 'everyone') return true;
    if(idstring.charAt(0) === '&') { // idstring is a role
        let tmp = guild.roles.cache.get(idstring.substring(1));
        if(tmp === undefined || tmp.deleted) return;
    } else { // idstring is a member
        let tmp = guild.members.cache.get(idstring);
        if(tmp === undefined || tmp.deleted || tmp.user.bot) return;
    }
    return true;
}

function parseOption(interaction, optionname) {
	const option = interaction.options.get(optionname);
	if (!option) return undefined;
	let value = option.value;
	if (!value || value === '') return undefined;

	let bits;
	switch (optionname) {
		case 'itemname':
			value = value.replace(/\*/g, '★'); // replace asterick with star
			value = value.replace(/[^a-zA-Z0-9★]/g, ''); // use only letters and numbers
			if (value === '') return undefined;
			return value;
		case 'enchant':
			return value;
		case 'enchantlevel':
			value = value.replace(/\s+/g, '').split(','); // remove whitespace; split by comma
			bits = 0;
			for(let numberOrRange of value) {
				for(let tmp of parsefuncs.parseNumberOrRange(numberOrRange, 0, 4))
					bits |= Math.pow(2, tmp);
			}
			if (bits === 0) return undefined;
			return bits;
		case 'refine':
			value = value.replace(/\s+/g, '').split(','); // remove whitespace; split by comma
			bits = 0;
			for(let numberOrRange of value) {
				for(let tmp of parsefuncs.parseNumberOrRange(numberOrRange, 0, 15))
					bits |= Math.pow(2, tmp);
			}
			if (bits === 0) return undefined;
			return bits;
		case 'slotted':
		case 'broken':
		case 'alias':
			return value ? 1 : 0;
		case 'category':
			const match = fuzzysort.go(value, lists.categoryWeighted, {
				threshold: -999,
				keys: ['searchName'],
				scoreFn: a => a[0] ? a[0].score+a.obj.addWeight : -1000
			})[0];
			if (match === undefined) return undefined;
			return match.obj.originalName;
		case 'pricehigher':
		case 'pricelower':
			value = parsefuncs.parseVerboseNumber(value);
			return value > 0 ? value : undefined;
		case 'stock':
			return value > 1 ? value : undefined;
		case 'assign':
			if (!value) return undefined;
			if (option.user && option.user.bot) return undefined;
			if (option.role && value === option.role.guild.id) return 'everyone';
			if (option.role) return '&'+value;
			return value;
	}
}

function valuesToString(valuesObj) {
	let str = '';
	for (let param of parameters) {
		if (param === 'assign') continue;
		let value = valuesObj[param];
		if (value === undefined) continue;

		if (param === 'slotted' || param === 'broken' || param === 'alias') value = value ? 'true' : 'false'
		if (param === 'enchantlevel' || param === 'refine') value = parsefuncs.binaryToNumberOrRangeList(value);
		str += ` ${param}:${value}`;
	}
	return str.slice(1);
}

