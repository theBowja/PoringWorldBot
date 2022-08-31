const { SlashCommandBuilder } = require('discord.js');
const dbfuncs = require('../dbfuncs.js');
const https = require('https');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pricecheck')
		.setDescription('Checks the price of the item on poring.world. Don\'t spam. Click more ads on poring.world please.')
		.addStringOption(opt => opt.setName('query')
								   .setDescription('The query to search poring.world. More accurate is better')
								   .setRequired(true))
		.setDMPermission(false),

	async execute(interaction) {
		const query = interaction.options.getString('query');
	    try {
	        let words = '';
	        let jsonMessage = await pcPoringWorld(query);

	        words += 'Item name : ' + jsonMessage[0].name + '\n';
	        words += 'Price : ' + jsonMessage[0].lastRecord.price + '\n';
	        words += 'Stock : ' + jsonMessage[0].lastRecord.stock;
	        return interaction.reply('```' + words + '```');

	    } catch(e) {
	    	return interaction.reply('Error: pricecheck failed');
	    }
	},
};

// quick price check for clean/unmodified equip
function pcPoringWorld(itemName) {
    return new Promise(function (resolve, reject) {
        https.get('https://poring.world/api/search?order=price&rarity=&inStock=&modified=0&category=&endCategory=&q=' + itemName, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                data = JSON.parse(data);

                resolve(data);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject(err.message);
        });
    });
};
