var lists = {};

lists.enchant = ['none', 'sharp', 'sharp blade', 'arch', 'zeal', 'morale',
                 'blasphemy', 'tenacity', 'divine blessing', 'armor breaking',
                 'anti mage', 'arcane', 'armor', 'magic', 'insight'];

lists.enchantV2 = ['None', 'Anti-Mage', 'Arcane', 'Arch', 'Armor', 'Armor Breaking', 'Blasphemy',
					'Divine Blessing', 'Insight', 'Magic', 'Morale', 'Sharp', 'Sharp Blade',
					'Tenacity', 'Zeal'];

lists.bool = ['yes', 'no', 'y', 'n', 'true', 'false', 't', 'f', '1', '0', 'on', 'off'];

// my favorite way of programming
lists.category = {
	'equipmentweapon': 'Equipment - Weapon',
	'equipmentoffhand': 'Equipment - Off-Hand',
	'equipmentarmor': 'Equipment - Armor',
	'equipmentgarment': 'Equipment - Garment',
	'equipmentfootgear': 'Equipment - Footgear',
	'equipmentaccessory': 'Equipment - Accessory',
	'weapon': 'Equipment - Weapon',
	'offhand': 'Equipment - Off-Hand',
	'armor': 'Equipment - Armor',
	'garment': 'Equipment - Garment',
	'footgear': 'Equipment - Footgear',
	'accessory': 'Equipment - Accessory',

	'headwearhead': 'Headwear - Head',
	'headwearface': 'Headwear - Face',
	'headwearmouth': 'Headwear - Mouth',
	'headwearback': 'Headwear - Back',
	'headweartail': 'Headwear - Tail',
	'head': 'Headwear - Head',
	'face': 'Headwear - Face',
	'mouth': 'Headwear - Mouth',
	'back': 'Headwear - Back',
	'tail': 'Headwear - Tail',

	'cardweapon': 'Card - Weapon',
	'cardoffhand': 'Card - Off-Hand',
	'cardarmor': 'Card - Armor',
	'cardgarment': 'Card - Garment',
	'cardshoe': 'Card - Shoe',
	'cardaccessory': 'Card - Accessory',
	'cardheadwear': 'Card - Headwear',
	'cardhead': 'Card - Headwear',

	'itempotion/effect': 'Item - Potion/Effect',
	'itempotion': 'Item - Potion/Effect',
	'itemeffect': 'Item - Potion/Effect',
	'itemrefine': 'Item - Refine',
	'itemscroll/album': 'Item - Scroll/Album',
	'itemscroll': 'Item - Scroll/Album',
	'itemalbum': 'Item - Scroll/Album',
	'itemmaterial': 'Item - Material',
	'itemholidaymaterial': 'Item - Holiday Material',
	'itempetmaterial': 'Item - Pet Material',

	'potion/effect': 'Item - Potion/Effect',
	'potion': 'Item - Potion/Effect',
	'effect': 'Item - Potion/Effect',
	'refine': 'Item - Refine',
	'scroll/album': 'Item - Scroll/Album',
	'scroll': 'Item - Scroll/Album',
	'album': 'Item - Scroll/Album',
	'material': 'Item - Material',
	'holidaymaterial': 'Item - Holiday Material',
	'petmaterial': 'Item - Pet Material',

	'card': 'Card',
	'blueprint': 'Blueprint',
	'bp': 'Blueprint',
	'mount': 'Mount',
	'costume': 'Costume',
	'premium': 'Premium',
};

lists.categoryV2 = ['Blueprint', 'Item - Potion/Effect', 'Item - Refine', 'Item - Scroll/Album', 'Item - Material',
					'Item - Holiday Material', 'Item - Pet Material', 'Card', 'Card - Weapon', 'Card - Off-Hand',
					'Card - Armor', 'Card - Garment', 'Card - Shoe', 'Card - Accessory', 'Card - Headwear', 'Mount',
					'Equipment - Weapon', 'Equipment - Off-Hand', 'Equipment - Armor', 'Equipment - Garment',
					'Equipment - Footgear', 'Equipment - Accessory', 'Headwear - Head', 'Headwear - Face',
					'Headwear - Back', 'Headwear - Mouth', 'Headwear - Tail', 'Costume', 'Premium'];
lists.categoryShort = ['Blueprint', 'Item', 'Card', 'Mount', 'Equipment', 'Headwear', 'Costume', 'Premium'];

lists.categoryWeighted = lists.categoryV2.concat(lists.categoryShort).map(category => (
	{ 
		searchName: category,
		originalName: category,
		addWeight: category.startsWith('Equipment') ? 10 : 0
	}
));
lists.categoryWeighted.push({ searchName: 'Head', originalName: 'Headwear - Head', addWeight: 0 });

lists.schedule = {
	'1' : 'dead',
	'11': ' 1',
	'21': ' 2',
	'31': ' 3',
	'41': ' 4',
	'51': '★',

	'3' : '%2B8',
	'13': '%2B10',
	'23': '%2B12',
	'33': '%2B14',
	'43': '%2B15',
	'53': 'broken',

	'5' : 'arcane',
	'15': 'morale',
	'25': 'arch',
	'35': 'zeal',
	'45': 'magic',
	'55': 'tenacity',

	'7' : 'sharp blade',
	'17': 'insight',
	'27': 'blasphemy',
	'37': 'armor breaking',
	'47': 'anti-mage',
	'57': 'divine blessing',

	'9' : 'armor',
	'19': 'rev',
	'29': 'Angel Snow Feather',
	'39': 'blueprint',
	'49': 'sharp 3',
	'59': 'sharp 4',
};

lists.parameter = [
	'name', 'na',
	'enchant', 'en',
	'enchantlevel', 'elevel', 'el',
	'refine', 're',
	'slotted', 'unslotted',
	'broken', 'unbroken',
	'alias',
	'category', 'ca',
	'pricehigher', 'ph',
	'pricelower', 'pl',
	'stock', 'st',
	'buyer', 'buyers', 'bu',
	'assign', 'as', 'for'
];

lists.joke = [
	"The Zeny in your bag has reached its capacity, It's going to be used to pay debts.",
    "For scheduled maintenance. All servers are shutting down in 5 seconds",
    "Jellopy in the Mysterious Box, I put them there...",
    "A good pair of shoes is required for walking about South Gate as there are Poring everywhere",
    "This isn't a bug, this is exactly my script. We'll have it optimized next time",
    "Hollgrehenn! Are you and Cat Friend not in love",
    "They say EXP Babe got killed, can anyone help me level up? I can sing Mr. Gold",
    "Zherlthsh, do you want to be my dancing partner? Alice, you come too",
    "They say there's a device in the Prontera Square that steals your Gold Coins as soon as you get close to it",
    "Hollgrehenn should you refine your skill points? Did you pick Refine level 1 and Weapon Destruction level 10?",
    "Anyone want to go divination with me? You go left and I go right",
    "I want to ride a warg as well, as I can shoot arrows too",
    "Hope you guys like my jokes, because this skill can't do shit",
    "Hey! Adventurer, can you help me kill 300 Dark Lords",
    "I hate Marc, and Marc Card",
    "Next~~~Start your performance",
    "This world needs a Savior. And I am... The one praising the Savior",
    "Really want to catch a Vocal for a pet",
    "Let me see who's there with the money",
    "One day I will go on a world channel concert tour, I'm counting on you guys to come and cheer for me",
    "Quiet down~You guys are disturbing me guarding love",
    "We agreed on you dealing damage and me supporting you, but now you think I suck.",
    "A dancer who can't tell dad jokes is not a good sage! Right? The Bard over there!",
    "My Mage and Big Man are not much different anymore because neither of us can instakill the dummy",
    "Leader towerclimb daily: Lord's Aura, Concentration, One-Hand Quicken, Enchant Blade... Priest get me up thanks",
    "Huh? That one dancing, she's not a dancer? The one riding Peco Peco?",
    "How come Sting only has two older brothers? Just cuz...",
    "I've always had fetishes because I'm a sage",
    "Hollgrehenn: Your companion watching your back is worth more than the toughest armor! So a little red hammer is nothing to worry about",
    "I was also a Dancer until I accidentally tapped on the NPC beside the Gashapon",
    "In the beginning you guys said RO is Free to Play, now I've deleted my family's entire savings",
    "A Knight who doesn't want to change jobs is not a good Alchemist",
    "Magnolia! Can you cook a Magnolia for me?",
    "No matter how strong you are, you can't instaskill 3 dummies and No Hunting",
    "How can you prove you are (Hunter) Elf if you don't wear the ears?"
]

lists.refineprice = [
	k => k, // 0
	k => k+35000, // 1
	k => k+80000, // 2
	k => k+135000, // 3
	k => k+200000, // 4
	k => 2.02*k+346800, // 5
	k => 3.08*k+655200, // 6
	k => 4.18*k+1250800, // 7
	k => 8.56*k+2559600, // 8
	k => 14.2*k+4801500, // 9
	k => 22.28*k+8058400, // 10
	k => 37.48*k+14569200, // 11
	k => 64.80*k+25694000, // 12
	k => 110.325994423*k+45337210, // 13
	k => 184.889698169*k+82150130, // 14
	k => 336.5*k+128295200 // 15
];

// if query string matches one of the following, then add the -alias parameter automatically
lists.aliasforce = ["mvpcard", "mvp★card", "mvpminicard", "mvpmini★card", "bosscard",
                    "minicard", "mini★card", "undeadcard", "deadcard", "revenantcard",
                    "ttcard", "ancienttier1", "ancienttier2", "ancienttier3", "ancienttier4",
                    "ancienttier5", "ancientvoucher", "militaryexploit", "militaryexploitchest"]
/*
['MVP Card', 'MVP★ Card', 'MVP/Mini Card', 'MVP/Mini★ Card', 'Boss Card',
                 'Mini Card', 'Mini★ Card', 'Undead Card', 'Dead Card', 'Revenant Card',
                 'TT Card', 'Ancient Tier 1', 'Ancient Tier 2', 'Ancient Tier 3', 'Ancient Tier 4',
                 'Ancient Tier 5', 'Ancient Voucher', 'Military Exploit', 'Military Exploit Chest'].map(e => prepName(e));
*/

module.exports = lists;