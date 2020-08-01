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
    .setTitle('User Command List')
    .addField('All commands must begin with `!pwb `',
    		  	'• `request` - [read this wiki for help on forming a proper snap request](https://github.com/theBowja/PoringWorldBot/wiki/Parameters-for-adding-a-request)\n' +
              	'example: !pwb req -na static shield -en tenacity -el 3,4\n' +
             	'• `show` - shows your information and all snap requests you have in this channel\n' +
       	       	'example: !pwb show\n' + 
       	       	'• `delete` - delete one of your snap requests using its request id\n' +
             	'example: !pwb delete 12\n' +
              	'• `budget` - sets the maximum snap price that you will get pinged for\n' +
              	'example: !pwb budget 20.7m\m' +
             	'example: !pwb budget delete')
    .setFooter('do `!pwb help misc` for more');

embeds.helpCommandsAdmin = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Admin Command List')
	.addField('All commands must begin with `!pwb `',
				'• `watch` - the bot will begin to watch this channel for user-submitted snap requests\n' +
                '• `request` - [read this wiki for help on forming a proper snap request](https://github.com/theBowja/PoringWorldBot/wiki/Parameters-for-adding-a-request)\n' +
                'example: !pwb req -na static shield -en tenacity -el 3,4 -assign \@billy\n' +
	            '• `show` - shows the information and all snap requests of the targeted user for this channel\n' +
                'example: !pwb show \@billy\n' +
                '• `delete` - deletes the snap request if you have a higher permission level\n' +
                'example: !pwb delete 12\n' +
                '• `budget` - sets the maximum snap price that the targeted user will get pinged for\n' +
                'example: !pwb budget \@billy 20.7m\n' +
                'example: !pwb budget \@billy delete\n' +
                '• `unwatch` - remove this channel from bot watch and delete all snap requests in it\n' +
                '• `search` - queries poring.world using the provided string\n' +
                'example: !pwb search natto kig\n' +
                '• `permit` - gives the targeted user a new permission level\n' +
                'example: !pwb permit \@billy 1\n')
	.setFooter('do `!pwb help misc` for more')

embeds.helpMiscCommands = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Misc Command List')
    .addField('All commands must be prefixed with `!pwb `',
    			'• `alive` - no response if the bot is offline\n' +
                '• `invite` - gives the invite link for this bot\n' +
                '• `thanks` - no problem\n' +
                '• `joke` - funny joke\n' +
                '• `stats {channel|bot}` - shows stats for the channel or bot');


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