export const OR = 'OR';
export const AND = 'AND';
export const NO = 'NO';

export const Color = [
	undefined, // 0

	'#17933c', // unit - green
	'#5174ff', // worker - blue
	'#2a45b1', // '#5174ff', // economy (gas) - blue

	'#2a45b1', // '#5174ff', // resource center - dark blue
	'#9097a0', // supply - ...
	'#a349a4', // production - pink
	'#ffd700', // tech structure - yellow
	'#ffd700', // addon - yellow
	'#00ac8c', // #b90d28 // defence - cyan

	'#ff7f27', // upgrade - orange
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
	DEFENCE: 9,
	
	UPGRADE: 10,
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
		categories: [Category.UNIT],
	},
	{
		title: 'Строения',
		categories: [Category.PRODUCTION, Category.TECH_STRUCTURE, Category.SUPPLY, Category.DEFENCE],
	},
	{
		title: 'Улучшения',
		categories: [Category.UPGRADE],
	},
	{
		title: 'Пристройки',
		categories: [Category.ADDON],
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

export const lang = {
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
// ксм = 60 минер/минуту


// при перелете здания на пристройку - лайн остается за зданием и перескакивает сама пристройка

// const _ = 0;

export const UnitsData = {
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
			mineralIncome: 60, gasIncome: '?', // 60 минералов в минуту, 1 минерал в секунду
		},
		{
			name: 'Refinery', icon: 'building-terran-refinery.png',
			category: Category.ECONOMY, requirement: [OR, EMPTY, 'Refinery'],
			buildTime: 21, mineralCost: 75,
			buildType: BuildType.WorkerBuild,
		},
		{
			name: 'MULE', icon: 'unit-terran-mule.png',
			category: Category.ECONOMY, requirement: 'Orbital station', visible: [AND, 'Command center', [NO, 'Planetary fortress']],
			buildTime: 0, mineralCost: 0,
			mineralIncome: 225, lifeTime: 60, buildTime: 60, /* buildTime - time to next mule */
			/* actually lifetime is 64 but we tweak it so we have pretty numbers */
		},
		// extra-supply
		// scan
		{
			name: 'Orbital station', icon: 'building-terran-orbitalstation.png',
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
			category: Category.ADDON, requirement: [AND, Category.PRODUCTION, [NO, Category.ADDON]],
			buildTime: 18, mineralCost: 50, gasCost: 25,
		},
		{
			name: 'Reactor', icon: 'building-terran-reactor.png', isWide: true,
			category: Category.ADDON, requirement: [AND, Category.PRODUCTION, [NO, Category.ADDON]],
			buildTime: 36, mineralCost: 50, gasCost: 50,
		},
		{
			name: 'Lift', icon: 'ability-terran-liftoff.png', isWide: true,
			category: Category.ADDON, requirement: [AND, Category.ADDON, COL_PRIMARY], visible: Category.PRODUCTION,
			buildTime: 5,
		},

		// units
		{
			name: 'Marine', icon: 'unit-terran-marine.png',
			category: Category.UNIT, requirement: [AND, 'Barracks', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 18, mineralCost: 50, supply: 1,
		},
		{
			name: 'Reaper', icon: 'unit-terran-reaper.png',
			category: Category.UNIT, requirement: [AND, 'Barracks', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 32, mineralCost: 50, gasCost: 50, supply: 1,
		},
		{
			name: 'Marauder', icon: 'unit-terran-marauder.png',
			category: Category.UNIT, requirement: [AND, 'Barracks', 'Techlab', COL_PRIMARY], visible: [AND, 'Barracks', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 21, mineralCost: 100, gasCost: 25, supply: 2,
		},
		{
			name: 'Ghost', icon: 'unit-terran-ghost.png',
			category: Category.UNIT, requirement: [AND, 'Barracks', 'Techlab', COL_PRIMARY], visible: [AND, 'Barracks', [OR, COL_PRIMARY, 'Reactor']], // globalReq: 'Ghost academy',
			buildTime: 29, mineralCost: 150, gasCost: 125, supply: 2,
		},

		{
			name: 'Hellion', icon: 'unit-terran-hellion.png',
			category: Category.UNIT, requirement: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 21, mineralCost: 100, supply: 2,
		},
		{
			name: 'Widow mine', icon: 'unit-terran-widowmine.png',
			category: Category.UNIT, requirement: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 21, mineralCost: 75, gasCost: 25, supply: 2,
		},
		{
			name: 'Cyclone', icon: 'unit-terran-cyclone.png',
			category: Category.UNIT, requirement: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 32, mineralCost: 125, gasCost: 50, supply: 2,
		},
		{
			name: 'Siege tank', icon: 'unit-terran-siegetank.png',
			category: Category.UNIT, requirement: [AND, 'Factory', 'Techlab', COL_PRIMARY], visible: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 32, mineralCost: 150, gasCost: 125, supply: 3,
		},
		{
			name: 'Hellion', icon: 'unit-terran-hellionbattlemode.png',
			category: Category.UNIT, requirement: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']], // globalReq: 'Armory',
			buildTime: 21, mineralCost: 100, supply: 2,
		},
		{
			name: 'Thor', icon: 'unit-terran-thor.png',
			category: Category.UNIT, requirement: [AND, 'Factory', 'Techlab', COL_PRIMARY], visible: [AND, 'Factory', [OR, COL_PRIMARY, 'Reactor']], // globalReq: 'Armory',
			buildTime: 42, mineralCost: 300, gasCost: 200, supply: 6,
		},

		{
			name: 'Viking', icon: 'unit-terran-vikingfighter.png',
			category: Category.UNIT, requirement: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 30, mineralCost: 150, gasCost: 75, supply: 2,
		},
		{
			name: 'Medivac', icon: 'unit-terran-medivac.png',
			category: Category.UNIT, requirement: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 30, mineralCost: 100, gasCost: 100, supply: 2,
		},
		{
			name: 'Liberator', icon: 'unit-terran-liberator.png',
			category: Category.UNIT, requirement: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 43, mineralCost: 150, gasCost: 125, supply: 3,
		},
		{
			name: 'Raven', icon: 'unit-terran-raven.png',
			category: Category.UNIT, requirement: [AND, 'Starport', 'Techlab', COL_PRIMARY], visible: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 43, mineralCost: 100, gasCost: 150, supply: 2,
		},
		{
			name: 'Banshee', icon: 'unit-terran-banshee.png',
			category: Category.UNIT, requirement: [AND, 'Starport', 'Techlab', COL_PRIMARY], visible: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']],
			buildTime: 43, mineralCost: 150, gasCost: 100, supply: 3,
		},
		{
			name: 'Battlecruiser', icon: 'unit-terran-battlecruiser.png',
			category: Category.UNIT, requirement: [AND, 'Starport', 'Techlab', COL_PRIMARY], visible: [AND, 'Starport', [OR, COL_PRIMARY, 'Reactor']], // globalReq: 'Fusion core',
			buildTime: 64, mineralCost: 400, gasCost: 300, supply: 6,
		},

		// upgrades
		{
			name: 'Stimpack', icon: 'ability-terran-stimpack-color.png',
			category: Category.UPGRADE, requirement: [AND, 'Barracks', 'Techlab', COL_SECONDARY],
			buildTime: 100, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Combat shields', icon: 'techupgrade-terran-combatshield-color.png',
			category: Category.UPGRADE, requirement: [AND, 'Barracks', 'Techlab', COL_SECONDARY],
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Concussive shells', icon: 'ability-terran-punishergrenade-color.png',
			category: Category.UPGRADE, requirement: [AND, 'Barracks', 'Techlab', COL_SECONDARY],
			buildTime: 43, mineralCost: 50, gasCost: 50,
		},

		{
			name: 'Infernal preigniter', icon: 'upgrade-terran-infernalpreigniter.png',
			category: Category.UPGRADE, requirement: [AND, 'Factory', 'Techlab', COL_SECONDARY],
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Hurricane trusters', icon: 'upgrade-terran-jotunboosters.png',
			category: Category.UPGRADE, requirement: [AND, 'Factory', 'Techlab', COL_SECONDARY],
			buildTime: 100, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Drilling claws', icon: 'upgrade-terran-researchdrillingclaws.png',
			category: Category.UPGRADE, requirement: [AND, 'Factory', 'Techlab', COL_SECONDARY], // globalReq: 'Armory',
			buildTime: 79, mineralCost: 75, gasCost: 75,
		},
		{
			name: 'Smart servos', icon: 'upgrade-terran-transformationservos.png',
			category: Category.UPGRADE, requirement: [AND, 'Factory', 'Techlab', COL_SECONDARY], // globalReq: 'Armory',
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},

		{
			name: 'Cloaking field', icon: 'ability-terran-cloak-color.png',
			category: Category.UPGRADE, requirement: [AND, 'Starport', 'Techlab', COL_SECONDARY],
			buildTime: 79, mineralCost: 100, gasCost: 100,
		},
		{
			name: 'Hyperflight rotors', icon: 'upgrade-terran-hyperflightrotors.png',
			category: Category.UPGRADE, requirement: [AND, 'Starport', 'Techlab', COL_SECONDARY],
			buildTime: 100, mineralCost: 125, gasCost: 125,
		},
		{
			name: 'Interference matrix', icon: 'upgrade-terran-interferencematrix.png',
			category: Category.UPGRADE, requirement: [AND, 'Starport', 'Techlab', COL_SECONDARY],
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