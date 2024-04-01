export const OR = 'OR';
export const AND = 'AND';
export const NO = 'NO';

export const Color = [
	undefined, // 0

	'#17933c', // unit - green
	'#5174ff', // worker - blue
	'#2a45b1', // '#5174ff', // economy (gas) - blue

	'#2a45b1', // '#5174ff', // resource center - dark blue
	'#00ac8c', // supply - teal (#9097a0 - grey)
	'#a349a4', // production - pink
	'#ffd700', // tech structure - yellow
	'#ffd700', // addon - yellow
	'#5174ff', // lift off - yellow
	'#b90d28', // #b90d28 // defence - red // (cyan  #00ac8c)

	'#ff7f27', // upgrade - orange
	'#8f40c6', // morph structure - violet
	'#8f40c6', // morph unit - violet
];

export const DragMode = {
	Single: 1, // drag single item
	Multiple: 2, // drag multiple items
	SingleWithSecondary: 3, // drag single item with secondary column
	MultipleWithSecondary: 4, // drag multiple items with secondary column
	Column: 5, // drag only column
};

export const Category = {
	UNIT: 1, // army
	WORKER: 2, // economy
	ECONOMY: 3, // economy
	
	RESOURCE_CENTER: 4, // economy
	SUPPLY: 5,
	PRODUCTION: 6,
	TECH_STRUCTURE: 7,
	ADDON: 8,
	LIFT_OFF: 9,
	DEFENCE: 10,
	
	UPGRADE: 11,
	MORPH_STRUCTURE: 12,
	MORPH_UNIT: 13,
};

export const BuildType = {
	NoWorker: 0,
	WorkerBuild: 1,
	WorkerMorph: 2,
};

export const ButtonCategories = [
	{
		title: 'Экономика',
		categories: [Category.RESOURCE_CENTER, Category.WORKER, Category.ECONOMY],
	},
	{
		title: 'Юниты',
		categories: [Category.UNIT, Category.MORPH_UNIT],
	},
	{
		title: 'Строения',
		categories: [Category.PRODUCTION, Category.TECH_STRUCTURE, Category.SUPPLY, Category.DEFENCE, Category.MORPH_STRUCTURE],
	},
	{
		title: 'Улучшения',
		categories: [Category.UPGRADE],
	},
	{
		title: 'Пристройки',
		categories: [Category.ADDON, Category.LIFT_OFF],
	},
];


export const EMPTY = 'EMPTY';
export const COL_PRIMARY = 'COL_PRIMARY';
export const COL_SECONDARY = 'COL_SECONDARY';
export const STRUCTURES = [
	OR,
	Category.ECONOMY, Category.RESOURCE_CENTER, Category.SUPPLY,
	Category.PRODUCTION, Category.TECH_STRUCTURE, Category.DEFENCE
];
const NO_LIFT_OFF = [NO, Category.LIFT_OFF];

export const lang = {
	'English': {},
	'Русский': {
		'Terran': 'Терран',
		'Zerg': 'Зерг',
		'Potoss': 'Протосс',

		// 'Economy structures': 'Экономика', // RESOURCE_CENTER, WORKER, ECONOMY, SUPPLY
		'Structures': 'Строения', // PRODUCTION, TECH_STRUCTURE, DEFENCE
		'Units': 'Юниты', // UNIT
		'Upgrades': 'Улучшения', // UPGRADE

		'Command center': 'Командный центр',
		'Orbital station': 'Станция наблюдения',

		/* 'Command center': 'Командный центр',
		'Command center': 'Командный центр',
		'Command center': 'Командный центр',
		'Command center': 'Командный центр',
		'Command center': 'Командный центр', */
	}
};


// 920/16

// 920-960 (960) инкам в минуту с 1й базы
// 1 сек => 16 минералов | 16 рабочих
// 1 сек => 1 минерал | 1 рабочий
// 940/16 = 58.75
// 944/16 = 59
// старт с 12 рабочих

// 920 / 60 ... 960 / 60

// 930 / 60 = 15.5 = 3968 / 128;

// 225 / 64 = 3.515625 = 450 / 128;


// 225  25 минералов, 9 ходок  225/64 = 3.515625
// 1.2эн в секунду
// 50эн за 60 сек
// ксм = 60 минер/минуту, 50 газа/минуту


// 320 газа в минуту
// 320 / 6 = 53.333

// при перелете здания на пристройку - лайн остается за зданием и перескакивает сама пристройка

export const Races = ['Terran', 'Zerg', 'Protoss'];

export const UnitsData = {
	Protoss: [],

	Zerg: [
		// economy
		{
			name: 'Hatchery', icon: 'building-zerg-hatchery.png',
			category: Category.RESOURCE_CENTER, requirement: EMPTY,
			buildTime: 71, mineralCost: 300, provideSupply: 6,
			buildType: BuildType.WorkerMorph, // maxLarva: 19
		},
		{
			name: 'Drone', icon: 'unit-zerg-drone.png',
			category: Category.WORKER, requirement: [OR, EMPTY, 'Drone'],
			buildTime: 12, mineralCost: 50, supply: 1,
			mineralIncome: 60, gasIncome: 53, // 60 минералов в минуту, 1 минерал в секунду
		},
		{
			name: 'Queen', icon: 'unit-zerg-queen.png',
			category: Category.ECONOMY, requirement: 'Hatchery',
			buildTime: 36, mineralCost: 150, supply: 2,
		},
		// inject
		// creep tumor
		{
			name: 'Overlord', icon: 'unit-zerg-overlord.png',
			category: Category.SUPPLY, requirement: [OR, EMPTY, [AND, 'Overlord', [NO, 'Overseer'], [NO, 'Droperlord']]],
			buildTime: 18, mineralCost: 100, provideSupply: 8,
		},
		{
			name: 'Overseer', icon: 'unit-zerg-overseer.png',
			category: Category.MORPH_UNIT, requirement: [AND, 'Overlord', [NO, 'Overseer'], [NO, 'Droperlord']],
			buildTime: 12, mineralCost: 50, gasCost: 50,
		},
		{
			name: 'Droperlord', icon: 'unit-zerg-overlordtransport.png',
			category: Category.MORPH_UNIT, requirement: [AND, 'Overlord', [NO, 'Overseer'], [NO, 'Droperlord']],
			buildTime: 12, mineralCost: 25, gasCost: 25,
		},
		{
			name: 'Extractor', icon: 'building-zerg-extractor.png',
			category: Category.ECONOMY, requirement: [OR, EMPTY, 'Extractor'],
			buildTime: 21, mineralCost: 25,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Lair', icon: 'building-zerg-lair.png',
			category: Category.MORPH_STRUCTURE, requirement: [AND, 'Hatchery', [NO, 'Lair'], COL_PRIMARY],
			buildTime: 57, mineralCost: 150, gasCost: 100,
		},
		{
			name: 'Hive', icon: 'building-zerg-hive.png',
			category: Category.MORPH_STRUCTURE, requirement: [AND, 'Lair', [NO, 'Hive'], COL_PRIMARY],
			buildTime: 71, mineralCost: 200, gasCost: 150,
		},

		// structures
		{
			name: 'Spawning pool', icon: 'building-zerg-spawningpool.png',
			category: Category.TECH_STRUCTURE, requirement: EMPTY,
			buildTime: 46, mineralCost: 200,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Roach warren', icon: 'building-zerg-roachwarren.png',
			category: Category.TECH_STRUCTURE, requirement: EMPTY,
			buildTime: 39, mineralCost: 150,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Baneling nest', icon: 'building-zerg-banelingnest.png',
			category: Category.TECH_STRUCTURE, requirement: EMPTY,
			buildTime: 43, mineralCost: 100, gasCost: 50,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Hydralisk den', icon: 'building-zerg-hydraliskden.png',
			category: Category.TECH_STRUCTURE, requirement: EMPTY,
			buildTime: 29, mineralCost: 100, gasCost: 100,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Spire', icon: 'building-zerg-spire.png',
			category: Category.TECH_STRUCTURE, requirement: EMPTY,
			buildTime: 71, mineralCost: 200, gasCost: 200,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Greater spire', icon: 'building-zerg-greaterspire.png',
			category: Category.MORPH_STRUCTURE, requirement: [AND, 'Spire', [NO, 'Greater spire']],
			buildTime: 71, mineralCost: 100, gasCost: 150,
		},
		{
			name: 'Infestation pit', icon: 'building-zerg-infestorpit.png',
			category: Category.TECH_STRUCTURE, requirement: EMPTY,
			buildTime: 36, mineralCost: 100, gasCost: 100,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Lurker den', icon: 'building-zerg-lurkerden.png',
			category: Category.TECH_STRUCTURE, requirement: EMPTY,
			buildTime: 57, mineralCost: 100, gasCost: 150,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Ultralisk cavern', icon: 'building-zerg-ultraliskcavern.png',
			category: Category.TECH_STRUCTURE, requirement: EMPTY,
			buildTime: 46, mineralCost: 150, gasCost: 200,
			buildType: BuildType.WorkerMorph,
		},

		{
			name: 'Evolution chamber', icon: 'building-zerg-evolutionchamber.png',
			category: Category.TECH_STRUCTURE, requirement: EMPTY,
			buildTime: 25, mineralCost: 75,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Nydus network', icon: 'building-zerg-nydusnetwork.png',
			category: Category.DEFENCE /* ? */, requirement: EMPTY,
			buildTime: 36, mineralCost: 150, gasCost: 150,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Nydus worm', icon: 'building-zerg-nydusworm.png',
			category: Category.DEFENCE /* ? */, requirement: 'Nydus network',
			buildTime: 14, mineralCost: 75, gasCost: 75,
		},
		{
			name: 'Spine crawler', icon: 'building-zerg-spinecrawler.png',
			category: Category.DEFENCE, requirement: [OR, EMPTY, 'Spine crawler'],
			buildTime: 36, mineralCost: 100,
			buildType: BuildType.WorkerMorph,
		},
		{
			name: 'Spore crawler', icon: 'building-zerg-sporecrawler.png',
			category: Category.DEFENCE, requirement: [OR, EMPTY, 'Spore crawler'],
			buildTime: 21, mineralCost: 75,
			buildType: BuildType.WorkerMorph,
		},

		// units
		{
			name: 'Zergling', icon: 'unit-zerg-zergling.png', isWide: true,
			category: Category.UNIT, requirement: [OR, EMPTY, [AND, 'Zergling', [NO, 'Baneling']]],
			buildTime: 17, mineralCost: 50, supply: 1, count: 2,
		},
		{
			name: 'Baneling', icon: 'unit-zerg-baneling.png',
			category: Category.MORPH_UNIT, requirement: [AND, 'Zergling', [NO, 'Baneling']],
			buildTime: 14, mineralCost: 25, gasCost: 25, /* -1 zergling for units count */
		},
		{
			name: 'Roach', icon: 'unit-zerg-roach.png',
			category: Category.UNIT, requirement: [OR, EMPTY, [AND, 'Roach', [NO, 'Ravager']]],
			buildTime: 19, mineralCost: 75, gasCost: 25, supply: 2,
		},
		{
			name: 'Ravager', icon: 'unit-zerg-ravager.png',
			category: Category.MORPH_UNIT, requirement: [AND, 'Roach', [NO, 'Ravager']],
			buildTime: 12, mineralCost: 25, gasCost: 75, supply: 1, /* 2 + 1 = 3 in total */
		},
		{
			name: 'Hydralisk', icon: 'unit-zerg-hydralisk.png',
			category: Category.UNIT, requirement: [OR, EMPTY, [AND, 'Hydralisk', [NO, 'Lurker']]],
			buildTime: 24, mineralCost: 100, gasCost: 50, supply: 2,
		},
		{
			name: 'Lurker', icon: 'unit-zerg-lurker.png',
			category: Category.MORPH_UNIT, requirement: [AND, 'Hydralisk', [NO, 'Lurker']],
			buildTime: 18, mineralCost: 50, gasCost: 100, supply: 1, /* 2 + 1 = 3 in total */
		},
		{
			name: 'Mutalisk', icon: 'unit-zerg-mutalisk.png',
			category: Category.UNIT, requirement: [OR, EMPTY, 'Mutalisk'],
			buildTime: 24, mineralCost: 100, gasCost: 100, supply: 2,
		},
		{
			name: 'Corruptor', icon: 'unit-zerg-corruptor.png',
			category: Category.UNIT, requirement: [OR, EMPTY, [AND, 'Corruptor', [NO, 'Broodlord']]],
			buildTime: 29, mineralCost: 150, gasCost: 100, supply: 2,
		},
		{
			name: 'Broodlord', icon: 'unit-zerg-mantalisk.png',
			category: Category.MORPH_UNIT, requirement: [AND, 'Corruptor', [NO, 'Broodlord']],
			buildTime: 24, mineralCost: 150, gasCost: 150, supply: 2, /* 2 + 2 = 4 in total */
		},
		{
			name: 'Infestor', icon: 'unit-zerg-infestor.png',
			category: Category.UNIT, requirement: [OR, EMPTY, 'Infestor'],
			buildTime: 36, mineralCost: 100, gasCost: 150, supply: 2,
		},
		{
			name: 'Swarm host', icon: 'unit-zerg-swarmhost.png',
			category: Category.UNIT, requirement: [OR, EMPTY, 'Swarm host'],
			buildTime: 29, mineralCost: 100, gasCost: 75, supply: 3,
		},
		{
			name: 'Viper', icon: 'unit-zerg-viper.png',
			category: Category.UNIT, requirement: [OR, EMPTY, 'Viper'],
			buildTime: 29, mineralCost: 100, gasCost: 200, supply: 3,
		},
		{
			name: 'Ultralisk', icon: 'unit-zerg-omegalisk.png',
			category: Category.UNIT, requirement: [OR, EMPTY, 'Ultralisk'],
			buildTime: 39, mineralCost: 275, gasCost: 200, supply: 6,
		},

		// upgrades
		{
			name: 'Metabolic boost', icon: 'upgrade-zerg-metabolicboost.png',
			category: Category.UPGRADE, requirement: 'Spawning pool',
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Adrenal glands', icon: 'upgrade-zerg-adrenalglands.png',
			category: Category.UPGRADE, requirement: 'Spawning pool',
			buildTime: 93, mineralCost: 200, gasCost: 200,
		},
		{
			name: 'Muscular augments', icon: 'upgrade-zerg-muscularaugments.png',
			category: Category.UPGRADE, requirement: 'Roach warren',
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Glial reconstitution', icon: 'upgrade-zerg-glialreconstitution.png',
			category: Category.UPGRADE, requirement: 'Roach warren',
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Centrifugal hooks', icon: 'upgrade-zerg-centrifugalhooks.png',
			category: Category.UPGRADE, requirement: 'Baneling nest',
			buildTime: 71, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Grooved spines', icon: 'upgrade-zerg-hotsgroovedspines.png',
			category: Category.UPGRADE, requirement: 'Hydralisk den',
			buildTime: 50, mineralCost: 75, gasCost: 75,
		},
		{
			name: 'Evolve muscular augments', icon: 'upgrade-zerg-evolvemuscularaugments.png',
			category: Category.UPGRADE, requirement: 'Hydralisk den',
			buildTime: 64, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Neural parasite', icon: 'ability-zerg-neuralparasite-color.png',
			category: Category.UPGRADE, requirement: 'Infestation pit',
			buildTime: 79, mineralCost: 150, gasCost: 150,
		},
		{
			name: 'Adaptive talons', icon: 'upgrade-zerg-adaptivetalons.png',
			category: Category.UPGRADE, requirement: 'Lurker den',
			buildTime: 57, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Seismic spines', icon: 'upgrade-zerg-seismicspines.png',
			category: Category.UPGRADE, requirement: 'Lurker den',
			buildTime: 57, mineralCost: 150, gasCost: 150,
		},
		{
			name: 'Chitinous plating', icon: 'upgrade-zerg-chitinousplating.png',
			category: Category.UPGRADE, requirement: 'Ultralisk cavern',
			buildTime: 79, mineralCost: 150, gasCost: 150,
		},
		{
			name: 'Anabolic synthesis', icon: 'upgrade-zerg-anabolicsynthesis.png',
			category: Category.UPGRADE, requirement: 'Ultralisk cavern',
			buildTime: 43, mineralCost: 150, gasCost: 150,
		},
		{
			name: 'Burrow', icon: 'ability-zerg-burrow-color.png',
			category: Category.UPGRADE, requirement: 'Hatchery',
			buildTime: 71, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Pneumatized carapace', icon: 'upgrade-zerg-pneumatizedcarapace.png',
			category: Category.UPGRADE, requirement: 'Hatchery',
			buildTime: 43, mineralCost: 100, gasCost: 100,
		},

		{
			name: 'Melee attacks 1', icon: 'upgrade-zerg-meleeattacks-level1.png',
			category: Category.UPGRADE, requirement: 'Evolution chamber',
			buildTime: 114, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Melee attacks 2', icon: 'upgrade-zerg-meleeattacks-level2.png',
			category: Category.UPGRADE, requirement: 'Evolution chamber',
			buildTime: 136, mineralCost: 150, gasCost: 150,
		},
		{
			name: 'Melee attacks 3', icon: 'upgrade-zerg-meleeattacks-level3.png',
			category: Category.UPGRADE, requirement: 'Evolution chamber',
			buildTime: 157, mineralCost: 200, gasCost: 200,
		},

		{
			name: 'Missile attacks 1', icon: 'upgrade-zerg-missileattacks-level1.png',
			category: Category.UPGRADE, requirement: 'Evolution chamber',
			buildTime: 114, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Missile attacks 2', icon: 'upgrade-zerg-missileattacks-level2.png',
			category: Category.UPGRADE, requirement: 'Evolution chamber',
			buildTime: 136, mineralCost: 150, gasCost: 150,
		},
		{
			name: 'Missile attacks 3', icon: 'upgrade-zerg-missileattacks-level3.png',
			category: Category.UPGRADE, requirement: 'Evolution chamber',
			buildTime: 157, mineralCost: 200, gasCost: 200,
		},

		{
			name: 'Ground carapace 1', icon: 'upgrade-zerg-groundcarapace-level1.png',
			category: Category.UPGRADE, requirement: 'Evolution chamber',
			buildTime: 114, mineralCost: 150, gasCost: 150,
		},
		{
			name: 'Ground carapace 2', icon: 'upgrade-zerg-groundcarapace-level2.png',
			category: Category.UPGRADE, requirement: 'Evolution chamber',
			buildTime: 136, mineralCost: 200, gasCost: 200,
		},
		{
			name: 'Ground carapace 3', icon: 'upgrade-zerg-groundcarapace-level3.png',
			category: Category.UPGRADE, requirement: 'Evolution chamber',
			buildTime: 157, mineralCost: 250, gasCost: 250,
		},

		{
			name: 'Air attacks 1', icon: 'upgrade-zerg-airattacks-level1.png',
			category: Category.UPGRADE, requirement: 'Spire',
			buildTime: 114, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Air attacks 2', icon: 'upgrade-zerg-airattacks-level2.png',
			category: Category.UPGRADE, requirement: 'Spire',
			buildTime: 136, mineralCost: 175, gasCost: 175,
		},
		{
			name: 'Air attacks 3', icon: 'upgrade-zerg-airattacks-level3.png',
			category: Category.UPGRADE, requirement: 'Spire',
			buildTime: 157, mineralCost: 250, gasCost: 250,
		},

		{
			name: 'Flyer carapace 1', icon: 'upgrade-zerg-flyercarapace-level1.png',
			category: Category.UPGRADE, requirement: 'Spire',
			buildTime: 114, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Flyer carapace 2', icon: 'upgrade-zerg-flyercarapace-level2.png',
			category: Category.UPGRADE, requirement: 'Spire',
			buildTime: 136, mineralCost: 175, gasCost: 175,
		},
		{
			name: 'Flyer carapace 3', icon: 'upgrade-zerg-flyercarapace-level3.png',
			category: Category.UPGRADE, requirement: 'Spire',
			buildTime: 157, mineralCost: 250, gasCost: 250,
		},
	],
	Terran: [
		// economy
		{
			name: 'Command center', icon: 'building-terran-commandcenter.png',
			category: Category.RESOURCE_CENTER, requirement: [AND, [NO, STRUCTURES], COL_PRIMARY],
			buildTime: 71, mineralCost: 400, provideSupply: 15,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'SCV', icon: 'unit-terran-scv.png',
			category: Category.WORKER, requirement: 'Command center',
			buildTime: 12, mineralCost: 50, supply: 1,
			mineralIncome: 60, gasIncome: 53, // 60 минералов в минуту, 1 минерал в секунду
		},
		{
			name: 'Refinery', icon: 'building-terran-refinery.png',
			category: Category.ECONOMY, requirement: [OR, EMPTY, 'Refinery'],
			buildTime: 21, mineralCost: 75,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'MULE', icon: 'unit-terran-mule.png',
			category: Category.ECONOMY, requirement: [AND, 'Orbital station', COL_SECONDARY], visible: [AND, 'Command center', [NO, 'Planetary fortress']],
			buildTime: 0, mineralCost: 0,
			mineralIncome: 225, lifeTime: 60, buildTime: 60, /* buildTime - time to next mule */
			/* actually lifetime is 64 but we tweak it so we have round income numbers */
			/* it will only affect period of time taken to earn income, it will not affect total mined resources amount */
		},
		// extra-supply
		// scan
		{
			name: 'Orbital station', icon: 'building-terran-orbitalstation.png', isWide: true,
			category: Category.ECONOMY, requirement: [AND, 'Command center', [NO, 'Orbital station'], [NO, 'Planetary fortress']],
			buildTime: 25, mineralCost: 150,
		},
		{
			name: 'Planetary fortress', icon: 'building-terran-planetaryfortress.png',
			category: Category.ECONOMY, requirement: [AND, 'Command center', [NO, 'Orbital station'], [NO, 'Planetary fortress']],
			buildTime: 36, mineralCost: 150, gasCost: 150,
		},

		// structures
		{
			name: 'Barracks', icon: 'building-terran-barracks.png',
			category: Category.PRODUCTION, requirement: [AND, [NO, STRUCTURES], COL_PRIMARY],
			buildTime: 46, mineralCost: 150,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Factory', icon: 'building-terran-factory.png',
			category: Category.PRODUCTION, requirement: [AND, [NO, STRUCTURES], COL_PRIMARY],
			buildTime: 43, mineralCost: 150, gasCost: 100,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Starport', icon: 'building-terran-starport.png',
			category: Category.PRODUCTION, requirement: [AND, [NO, STRUCTURES], COL_PRIMARY],
			buildTime: 36, mineralCost: 150, gasCost: 100,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Engineering bay', icon: 'building-terran-engineeringbay.png',
			category: Category.TECH_STRUCTURE, requirement: [AND, [NO, STRUCTURES], COL_PRIMARY],
			buildTime: 25, mineralCost: 125,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Armory', icon: 'building-terran-armory.png',
			category: Category.TECH_STRUCTURE, requirement: [AND, [NO, STRUCTURES], COL_PRIMARY],
			buildTime: 46, mineralCost: 150, gasCost: 100,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Ghost academy', icon: 'building-terran-ghostacademy.png',
			category: Category.TECH_STRUCTURE, requirement: [AND, [NO, STRUCTURES], COL_PRIMARY],
			buildTime: 29, mineralCost: 150, gasCost: 50,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Fusion core', icon: 'building-terran-fusioncore.png',
			category: Category.TECH_STRUCTURE, requirement: [AND, [NO, STRUCTURES], COL_PRIMARY],
			buildTime: 46, mineralCost: 150, gasCost: 150,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Supply depot', icon: 'building-terran-supplydepot.png',
			category: Category.SUPPLY, requirement: [OR, EMPTY, 'Supply depot'],
			buildTime: 21, mineralCost: 100, provideSupply: 8,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Bunker', icon: 'building-terran-bunker.png',
			category: Category.DEFENCE, requirement: [OR, EMPTY, 'Bunker'],
			buildTime: 29, mineralCost: 100,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Missile turret', icon: 'building-terran-missileturret.png',
			category: Category.DEFENCE, requirement: [OR, EMPTY, 'Missile turret'],
			buildTime: 18, mineralCost: 100,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Sensor tower', icon: 'building-terran-sensordome.png',
			category: Category.DEFENCE, requirement: [OR, EMPTY, 'Sensor tower'],
			buildTime: 18, mineralCost: 125, gasCost: 100,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'Techlab', icon: 'building-terran-techlab.png', isWide: true,
			category: Category.ADDON, requirement: [AND, Category.PRODUCTION, [NO, Category.ADDON], NO_LIFT_OFF], visible: Category.PRODUCTION,
			buildTime: 18, mineralCost: 50, gasCost: 25,
		},
		{
			name: 'Reactor', icon: 'building-terran-reactor.png', isWide: true,
			category: Category.ADDON, requirement: [AND, Category.PRODUCTION, [NO, Category.ADDON], NO_LIFT_OFF], visible: Category.PRODUCTION,
			buildTime: 36, mineralCost: 50, gasCost: 50,
		},
		{
			name: 'Lift off', icon: 'ability-terran-liftoff.png', isWide: true,
			category: Category.LIFT_OFF, requirement: [AND, Category.ADDON, COL_PRIMARY, NO_LIFT_OFF], visible: Category.PRODUCTION,
			buildTime: 5,
		},

		// units
		{
			name: 'Marine', icon: 'unit-terran-marine.png',
			category: Category.UNIT, requirement: [AND, 'Barracks', [OR, COL_PRIMARY, 'Reactor'], NO_LIFT_OFF], visible: [AND, 'Barracks', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 18, mineralCost: 50, supply: 1,
		},
		{
			name: 'Reaper', icon: 'unit-terran-reaper.png',
			category: Category.UNIT, requirement: [AND, 'Barracks', [OR, COL_PRIMARY, 'Reactor'], NO_LIFT_OFF], visible: [AND, 'Barracks', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 32, mineralCost: 50, gasCost: 50, supply: 1,
		},
		{
			name: 'Marauder', icon: 'unit-terran-marauder.png',
			category: Category.UNIT, requirement: [AND, 'Barracks', 'Techlab', COL_PRIMARY, NO_LIFT_OFF], visible: [AND, 'Barracks', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 21, mineralCost: 100, gasCost: 25, supply: 2,
		},
		{
			name: 'Ghost', icon: 'unit-terran-ghost.png',
			category: Category.UNIT, requirement: [AND, 'Barracks', 'Techlab', COL_PRIMARY, NO_LIFT_OFF], visible: [AND, 'Barracks', [OR, COL_PRIMARY, 'Reactor']], // globalReq: 'Ghost academy',
			buildTime: 29, mineralCost: 150, gasCost: 125, supply: 2,
		},

		{
			name: 'Hellion', icon: 'unit-terran-hellion.png',
			category: Category.UNIT, requirement: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor'], NO_LIFT_OFF], visible: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 21, mineralCost: 100, supply: 2,
		},
		{
			name: 'Widow mine', icon: 'unit-terran-widowmine.png',
			category: Category.UNIT, requirement: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor'], NO_LIFT_OFF], visible: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 21, mineralCost: 75, gasCost: 25, supply: 2,
		},
		{
			name: 'Cyclone', icon: 'unit-terran-cyclone.png',
			category: Category.UNIT, requirement: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor'], NO_LIFT_OFF], visible: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 32, mineralCost: 125, gasCost: 50, supply: 2,
		},
		{
			name: 'Siege tank', icon: 'unit-terran-siegetank.png',
			category: Category.UNIT, requirement: [AND, 'Factory', 'Techlab', COL_PRIMARY, NO_LIFT_OFF], visible: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 32, mineralCost: 150, gasCost: 125, supply: 3,
		},
		{
			name: 'Hellbat', icon: 'unit-terran-hellionbattlemode.png',
			category: Category.UNIT, requirement: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor'], NO_LIFT_OFF], visible: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']], // globalReq: 'Armory',
			buildTime: 21, mineralCost: 100, supply: 2,
		},
		{
			name: 'Thor', icon: 'unit-terran-thor.png',
			category: Category.UNIT, requirement: [AND, 'Factory', 'Techlab', COL_PRIMARY, NO_LIFT_OFF], visible: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']], // globalReq: 'Armory',
			buildTime: 42, mineralCost: 300, gasCost: 200, supply: 6,
		},

		{
			name: 'Viking', icon: 'unit-terran-vikingfighter.png',
			category: Category.UNIT, requirement: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor'], NO_LIFT_OFF], visible: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 30, mineralCost: 150, gasCost: 75, supply: 2,
		},
		{
			name: 'Medivac', icon: 'unit-terran-medivac.png',
			category: Category.UNIT, requirement: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor'], NO_LIFT_OFF], visible: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 30, mineralCost: 100, gasCost: 100, supply: 2,
		},
		{
			name: 'Liberator', icon: 'unit-terran-liberator.png',
			category: Category.UNIT, requirement: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor'], NO_LIFT_OFF], visible: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 43, mineralCost: 150, gasCost: 125, supply: 3,
		},
		{
			name: 'Raven', icon: 'unit-terran-raven.png',
			category: Category.UNIT, requirement: [AND, 'Starport', 'Techlab', COL_PRIMARY, NO_LIFT_OFF], visible: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 43, mineralCost: 100, gasCost: 150, supply: 2,
		},
		{
			name: 'Banshee', icon: 'unit-terran-banshee.png',
			category: Category.UNIT, requirement: [AND, 'Starport', 'Techlab', COL_PRIMARY, NO_LIFT_OFF], visible: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 43, mineralCost: 150, gasCost: 100, supply: 3,
		},
		{
			name: 'Battlecruiser', icon: 'unit-terran-battlecruiser.png',
			category: Category.UNIT, requirement: [AND, 'Starport', 'Techlab', COL_PRIMARY, NO_LIFT_OFF], visible: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']], // globalReq: 'Fusion core',
			buildTime: 64, mineralCost: 400, gasCost: 300, supply: 6,
		},

		// upgrades
		{
			name: 'Stimpack', icon: 'ability-terran-stimpack-color.png',
			category: Category.UPGRADE, requirement: [AND, 'Barracks', 'Techlab', COL_SECONDARY, NO_LIFT_OFF], visible: [AND, 'Barracks', 'Techlab', COL_SECONDARY],
			buildTime: 100, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Combat shields', icon: 'techupgrade-terran-combatshield-color.png',
			category: Category.UPGRADE, requirement: [AND, 'Barracks', 'Techlab', COL_SECONDARY, NO_LIFT_OFF], visible: [AND, 'Barracks', 'Techlab', COL_SECONDARY],
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Concussive shells', icon: 'ability-terran-punishergrenade-color.png',
			category: Category.UPGRADE, requirement: [AND, 'Barracks', 'Techlab', COL_SECONDARY, NO_LIFT_OFF], visible: [AND, 'Barracks', 'Techlab', COL_SECONDARY],
			buildTime: 43, mineralCost: 50, gasCost: 50,
		},

		{
			name: 'Infernal preigniter', icon: 'upgrade-terran-infernalpreigniter.png',
			category: Category.UPGRADE, requirement: [AND, 'Factory', 'Techlab', COL_SECONDARY, NO_LIFT_OFF], visible: [AND, 'Factory', 'Techlab', COL_SECONDARY],
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Hurricane trusters', icon: 'upgrade-terran-jotunboosters.png',
			category: Category.UPGRADE, requirement: [AND, 'Factory', 'Techlab', COL_SECONDARY, NO_LIFT_OFF], visible: [AND, 'Factory', 'Techlab', COL_SECONDARY],
			buildTime: 100, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Drilling claws', icon: 'upgrade-terran-researchdrillingclaws.png',
			category: Category.UPGRADE, requirement: [AND, 'Factory', 'Techlab', COL_SECONDARY, NO_LIFT_OFF], visible: [AND, 'Factory', 'Techlab', COL_SECONDARY], // globalReq: 'Armory',
			buildTime: 79, mineralCost: 75, gasCost: 75,
		},
		{
			name: 'Smart servos', icon: 'upgrade-terran-transformationservos.png',
			category: Category.UPGRADE, requirement: [AND, 'Factory', 'Techlab', COL_SECONDARY, NO_LIFT_OFF], visible: [AND, 'Factory', 'Techlab', COL_SECONDARY], // globalReq: 'Armory',
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},

		{
			name: 'Cloaking field', icon: 'ability-terran-cloak-color.png',
			category: Category.UPGRADE, requirement: [AND, 'Starport', 'Techlab', COL_SECONDARY, NO_LIFT_OFF], visible: [AND, 'Starport', 'Techlab', COL_SECONDARY],
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Hyperflight rotors', icon: 'upgrade-terran-hyperflightrotors.png',
			category: Category.UPGRADE, requirement: [AND, 'Starport', 'Techlab', COL_SECONDARY, NO_LIFT_OFF], visible: [AND, 'Starport', 'Techlab', COL_SECONDARY],
			buildTime: 100, mineralCost: 125, gasCost: 125,
		},
		{
			name: 'Interference matrix', icon: 'upgrade-terran-interferencematrix.png',
			category: Category.UPGRADE, requirement: [AND, 'Starport', 'Techlab', COL_SECONDARY, NO_LIFT_OFF], visible: [AND, 'Starport', 'Techlab', COL_SECONDARY],
			buildTime: 57, mineralCost: 50, gasCost: 50,
		},

		{
			name: 'Personal cloak', icon: 'ability-terran-cloak-color.png',
			category: Category.UPGRADE, requirement: 'Ghost academy',
			buildTime: 86, mineralCost: 150, gasCost: 150,
		},
		{
			name: 'Nuke', icon: 'ability-terran-armnuke.png',
			category: Category.UPGRADE, requirement: [AND, 'Ghost academy', [NO, 'Nuke']], visible: 'Ghost academy', // globalReq: 'Factory'
			buildTime: 43, mineralCost: 100, gasCost: 100,
		},

		{
			name: 'Weapon systems (Yamato)', icon: 'ability-terran-yamatogun-color.png',
			category: Category.UPGRADE, requirement: 'Fusion core',
			buildTime: 100, mineralCost: 150, gasCost: 150,
		},
		{
			name: 'Caduceus reactor', icon: 'upgrade-terran-caduceusreactor.png',
			category: Category.UPGRADE, requirement: 'Fusion core',
			buildTime: 50, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Advanced ballistics', icon: 'upgrade-terran-advanceballistics.png',
			category: Category.UPGRADE, requirement: 'Fusion core',
			buildTime: 79, mineralCost: 150, gasCost: 150,
		},

		{
			name: 'Infantry weapons 1', icon: 'upgrade-terran-infantryweaponslevel1.png',
			category: Category.UPGRADE, requirement: 'Engineering bay',
			buildTime: 114, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Infantry weapons 2', icon: 'upgrade-terran-infantryweaponslevel2.png',
			category: Category.UPGRADE, requirement: 'Engineering bay',
			buildTime: 136, mineralCost: 175, gasCost: 175,
		},
		{
			name: 'Infantry weapons 3', icon: 'upgrade-terran-infantryweaponslevel3.png',
			category: Category.UPGRADE, requirement: 'Engineering bay',
			buildTime: 157, mineralCost: 250, gasCost: 250,
		},

		{
			name: 'Infantry armor 1', icon: 'upgrade-terran-infantryarmorlevel1.png',
			category: Category.UPGRADE, requirement: 'Engineering bay',
			buildTime: 114, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Infantry armor 2', icon: 'upgrade-terran-infantryarmorlevel2.png',
			category: Category.UPGRADE, requirement: 'Engineering bay',
			buildTime: 136, mineralCost: 175, gasCost: 175,
		},
		{
			name: 'Infantry armor 3', icon: 'upgrade-terran-infantryarmorlevel3.png',
			category: Category.UPGRADE, requirement: 'Engineering bay',
			buildTime: 157, mineralCost: 250, gasCost: 250,
		},

		{
			name: 'Vehicle weapons 1', icon: 'upgrade-terran-vehicleweaponslevel1.png',
			category: Category.UPGRADE, requirement: 'Armory',
			buildTime: 114, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Vehicle weapons 2', icon: 'upgrade-terran-vehicleweaponslevel2.png',
			category: Category.UPGRADE, requirement: 'Armory',
			buildTime: 136, mineralCost: 175, gasCost: 175,
		},
		{
			name: 'Vehicle weapons 3', icon: 'upgrade-terran-vehicleweaponslevel3.png',
			category: Category.UPGRADE, requirement: 'Armory',
			buildTime: 157, mineralCost: 250, gasCost: 250,
		},

		{
			name: 'Vehicle platting 1', icon: 'upgrade-terran-vehicleplatinglevel1.png',
			category: Category.UPGRADE, requirement: 'Armory',
			buildTime: 114, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Vehicle platting 2', icon: 'upgrade-terran-vehicleplatinglevel2.png',
			category: Category.UPGRADE, requirement: 'Armory',
			buildTime: 136, mineralCost: 175, gasCost: 175,
		},
		{
			name: 'Vehicle platting 3', icon: 'upgrade-terran-vehicleplatinglevel3.png',
			category: Category.UPGRADE, requirement: 'Armory',
			buildTime: 157, mineralCost: 250, gasCost: 250,
		},

		{
			name: 'Ship weapons 1', icon: 'upgrade-terran-shipweaponslevel1.png',
			category: Category.UPGRADE, requirement: 'Armory',
			buildTime: 114, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Ship weapons 2', icon: 'upgrade-terran-shipweaponslevel2.png',
			category: Category.UPGRADE, requirement: 'Armory',
			buildTime: 136, mineralCost: 175, gasCost: 175,
		},
		{
			name: 'Ship weapons 3', icon: 'upgrade-terran-shipweaponslevel3.png',
			category: Category.UPGRADE, requirement: 'Armory',
			buildTime: 157, mineralCost: 250, gasCost: 250,
		},

		{
			name: 'Targeting systems', icon: 'upgrade-terran-hisecautotracking.png',
			category: Category.UPGRADE, requirement: 'Engineering bay',
			buildTime: 57, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Neosteel armor', icon: 'upgrade-terran-buildingarmor.png',
			category: Category.UPGRADE, requirement: 'Engineering bay',
			buildTime: 100, mineralCost: 150, gasCost: 150,
		},
	]
};