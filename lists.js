var lists = {};

lists.enchant = ['none', 'sharp', 'sharpblade', 'arch', 'zeal', 'morale',
                 'blasphemy', 'tenacity', 'divineblessing', 'armorbreaking',
                 'antimage', 'arcane', 'armor', 'magic', 'insight'];

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

lists.schedule = {
	'1' : 'broken',
	'11': ' 1',
	'21': ' 2',
	'31': ' 3',
	'41': ' 4',
	'51': '★',

	'3' : '+8',
	'13': '+10',
	'23': '+12',
	'33': '+14',
	'43': '+15',
	//'53': '',

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
	//'19': 'sharp 4',
	'29': 'Angel Snow Feather',
	'39': 'sharp 2',
	'49': 'sharp 3',
	'59': 'sharp 4',
};

module.exports = lists;