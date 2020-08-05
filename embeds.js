const Discord = require('discord.js');
const parsefuncs = require('./parse.js');

let embeds = {};


/**
 * Builds an embed for showing snaps
 * @param snaprecord {object} a record from the currentsnaps table
 */
embeds.buildSnappingInfo = function(snaprecord) {
    let embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(parsefuncs.buildItemFullName(snaprecord))
        // .setDescription(`💰 ${snaprecord.price.toLocaleString()} zeny\n` +
        //                 `📊 ${snaprecord.stock} stock\n\n` +
        //                 `⌛ ${Math.floor((new Date(snaprecord.snapend*1000) - new Date())/60000)} minutes left`);
        .setDescription(`Price: **${snaprecord.price.toLocaleString()}** z\n` +
                        `Stock: **${snaprecord.stock}**\n` +
                        `Buyers: **${snaprecord.buyers}**\n\n` +
                        `Time left: **${Math.floor((new Date(snaprecord.snapend*1000) - new Date())/60000)}** minutes`);
    if(snaprecord.icon.startsWith("card")) {
        embed.setThumbnail(`https://www.romcodex.com/pic/cards/${snaprecord.icon}.jpg`);
    } else {
        embed.setThumbnail(`https://www.poring.world/sprites/${snaprecord.icon}.png`);
    }
    return embed;
};

// dunno if this belongs here but here it is
embeds.helpCommandsBasic = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .addField('User Command List',
    		  	'`!pwb request [-<parameter> <value>] ...`\n- [read this wiki for help on forming a proper snap request](https://github.com/theBowja/PoringWorldBot/wiki/Parameters-for-adding-a-request)\n' +
             	'`!pwb show`\n- shows your information and all snap requests you have in this channel\n' +
       	       	'`!pwb delete <reqid>`\n- delete one of your snap requests using its request id\n' +
              	'`!pwb budget {<number>|delete}`\n- sets the maximum snap price that you will get pinged for')
    .setFooter('do `!pwb help misc` for more');

embeds.helpCommandsAdmin = new Discord.MessageEmbed()
    .setColor('#0099ff')
	.addField('Admin Command List',
				'`!pwb watch [<limitedto>]`\n- the bot will begin to watch this channel for user-submitted snap requests\n' +
                '`!pwb request [-<parameter> <value>]...`\n- [read this wiki for help on forming a proper snap request](https://github.com/theBowja/PoringWorldBot/wiki/Parameters-for-adding-a-request)\n' +
	            '`!pwb show {<@user>|<@role>|everyone|here}`\n- shows the information and all snap requests of the targeted user for this channel\n' +
                '`!pwb delete <reqid>`\n- deletes the snap request if you have a higher permission level\n' +
                '`!pwb budget {<@user>|<@role>|everyone|here>} {<number>|delete} `\n- sets the maximum snap price that the targeted user will get pinged for\n' +
                '`!pwb unwatch`\n- remove this channel from bot watch and delete all snap requests in it\n' +
                '`!pwb search <querystring>`\n- queries poring.world using the provided string\n' +
                '`!pwb permit {<@user>|<@role>} <permissionlevel>`\n- gives the targeted user a new permission level')
	.setFooter('do `!pwb help misc` for more')

embeds.helpMiscCommands = new Discord.MessageEmbed()
    .setColor('#0099ff')
    // .setTitle('Misc Command List')
    // .addField('• alive - `!pwb alive`', 'no response if the bot is offline')
    // .addField('• invite - `!pwb invite`', 'gives the invite link for this bot')
    // .addField('• thanks - `!pwb thanks`', 'no problem')
    // .addField('• joke - `!pwb joke`', 'funny joke')
    // .addField('• stats - `!pwb stats {channel|bot}`', 'shows stats for the channel or bot');
    .addField('Misc Command List',
    			'• `!pwb alive` - no response if the bot is offline\n' +
                '• `!pwb invite` - gives the invite link for this bot\n' +
                '• `!pwb thanks` - no problem\n' +
                '• `!pwb joke` - funny joke\n' +
                '• `!pwb stats {channel|bot}` - shows stats for the channel or bot');


embeds.helpRequestParameters = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Request Parameter List')
    .addField('All commands must be prefixed with `!pwb `',
    			'• `-name` -\n' +
                '• `-enchant` - \n' +
                '• `-enchantlevel` - \n' +
                '• `-refine` - \n' +
                '• `-slotted` - \n' +
                '• `-broken` - \n' +
                '• `-alias` - \n' +
                '• `-category` - \n' +
                '• `-pricehigher` - \n' +
                '• `-pricelower` - \n' +
                '• `-stock` - \n' +
                '• `-buyers` - don\'t use doesn\'t work yet\n' +
                '• `-assign` - ')
    .setFooter('do `!pwb help examples` for examples');

embeds.helpRequestExamples = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Request Example List')
    .addField('All commands must be prefixed with `!pwb `',
    			'\n' +
    			'zzz\n' +
   				'zzz');



module.exports = embeds;