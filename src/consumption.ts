import { NamedElement, Option, dummyObservable, dummyMethod, dummyComputed } from './util';
import { Demand } from './production';
import { ResidenceBuilding, PopulationLevel } from './population';
import { guidToNumber } from './type-utils';

declare const ko: any;
declare const view: any;

// Temporary type definitions until full conversion
interface Product {
    guid: string;
    addNeed(need: any): void;
}

interface Island {
    // Placeholder until converted
}

/**
 * Base class for all consumption needs in the game
 * Extends Demand to provide consumption-specific functionality
 */
export class Need extends Demand {
    public isNeed: boolean;
    public excludePopulationFromMoneyAndConsumptionCalculation: boolean;
    public isBonusNeed: boolean;
    public tpmin: number;
    public residents: number;
    public happiness: boolean;

    /**
     * Creates a new Need instance
     * @param config - Configuration object for the need
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, assetsMap: Map<string, any>) {
        super(config, assetsMap);
        this.isNeed = true;
        this.excludePopulationFromMoneyAndConsumptionCalculation = !!config.excludePopulationFromMoneyAndConsumptionCalculation;
        this.isBonusNeed = !!config.isBonusNeed;
        this.tpmin = config.tpmin || 0;
        this.residents = config.residents || 0;
        this.happiness = !!config.happiness;
    }
}

/**
 * Represents a need for a specific residence building
 * Manages the relationship between a residence and its consumption needs
 */
export class ResidenceNeed {
    public residence!: ResidenceBuilding; // Non-null assertion
    public need!: PopulationNeed; // Non-null assertion
    public substitution: any;
    public fulfillment: any;
    public amount?: any;
    public residentsPerHouse: any;
    public residents: any;
    public residenceNeedsMap?: Map<string, any>;
    public substitutionSubscription?: any;

    /**
     * Creates a new ResidenceNeed instance
     * @param residence - The residence building this need belongs to
     * @param need - The population need this residence need represents
     */
    constructor(residence: ResidenceBuilding, need: PopulationNeed) {
        // Validate required parameters
        if (!residence) {
            throw new Error('ResidenceNeed residence is required');
        }
        if (!need) {
            throw new Error('ResidenceNeed need is required');
        }

        // Explicit assignments
        this.residence = residence;
        this.need = need;

        // Dummy assignments for late-initialized properties
        this.substitution = dummyObservable<number>('ResidenceNeed.substitution');
        this.fulfillment = dummyObservable<number>('ResidenceNeed.fulfillment');
        this.amount = dummyComputed<number>('ResidenceNeed.amount');
        this.residentsPerHouse = dummyComputed<number>('ResidenceNeed.residentsPerHouse');
        this.residents = dummyComputed<number>('ResidenceNeed.residents');
        this.substitutionSubscription = dummyComputed<void>('ResidenceNeed.substitutionSubscription');

        // Initialize with default values
        this.substitution(0);
        this.fulfillment(0);

        this.amount = ko.pureComputed(() => {
            // Type guard to ensure properties are not null
            if (!this.residence || !this.need) {
                console.warn('ResidenceNeed: residence or need is null, this should not happen');
                return 0;
            }
            // Check if consumingLimit is available
            const consumingLimit = this.residence!.consumingLimit;
            if (!consumingLimit) {
                console.warn('ResidenceNeed: consumingLimit is null');
                return 0;
            }
            // Use non-null assertion operator
            var total = consumingLimit() * this.need!.tpmin;
            return total * (Math.max(0, this.fulfillment() - this.substitution()));
        });

        this.need.addResidenceNeed(this);

        this.residentsPerHouse = ko.pureComputed(() => {
            var sum = this.residence.residentsPerNeed.get(guidToNumber(this.need.guid)) || 0;
            for (var c of this.residence.getConsumptionEntries(this.need)) {
                var coverage = c.residenceEffectCoverage.coverage();
                sum += coverage * (c.residenceEffectEntry.residents || 0);
            }
            return sum;
        });

        this.residents = ko.pureComputed(() => {
            var sum = this.residence.existingBuildings() * (this.residence.residentsPerNeed.get(guidToNumber(this.need.guid)) || 0);
            for (var c of this.residence.getConsumptionEntries(this.need)) {
                var coverage = c.residenceEffectCoverage.coverage();
                sum += Math.round(coverage * this.residence.existingBuildings()) *(c.residenceEffectEntry.residents || 0);
            }
            return Math.floor(sum * this.fulfillment());
        })
    }

    /**
     * Initializes dependencies and sets up subscriptions for this residence need
     * @param residenceNeedsMap - Map of all residence needs for this residence
     */
    initDependencies(residenceNeedsMap: Map<string, any>): void {
        this.residenceNeedsMap = residenceNeedsMap;
        this.substitutionSubscription = ko.computed(() => {
            var arr = this.residence.getConsumptionEntries(this.need);
            if(arr == null)
                return; // no effect for this product
            
            var suppliedByFulfillment = 0;
            var modifier = 0;
            for (var c of arr){
                var coverage = c.residenceEffectCoverage.coverage();
                modifier += c.residenceEffectEntry.consumptionModifier * coverage;
                            for (var p of c.residenceEffectEntry.suppliedBy){
                var n = this.residenceNeedsMap?.get(p.guid.toString());

                if(n != null)
                    suppliedByFulfillment = Math.max(suppliedByFulfillment, coverage * n.fulfillment())
            }
            }

            this.substitution(Math.min(1, suppliedByFulfillment - modifier / 100));

            if (this.need.isInactive()) {
                this.fulfillment(0);
                return;
            }

            if (!this.need.banned()) {
                this.fulfillment(1);
                return;
            }

            this.fulfillment(suppliedByFulfillment);
        });
    }
}

/**
 * Represents a need for a public building
 * Extends Option to provide public building-specific functionality
 */
export class PublicBuildingNeed extends Option {
    public excludePopulationFromMoneyAndConsumptionCalculation: boolean;
    public level: PopulationLevel;
    public product: Product;
    public initBans: (level: PopulationLevel, assetsMap: Map<string, any>) => void;

    /**
     * Creates a new PublicBuildingNeed instance
     * @param config - Configuration object for the need
     * @param level - The population level this need belongs to
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, level: PopulationLevel, assetsMap: Map<string, any>) {
        // Validate required parameters
        if (!config) {
            throw new Error('PublicBuildingNeed config is required');
        }
        if (!level) {
            throw new Error('PublicBuildingNeed level is required');
        }
        if (!assetsMap) {
            throw new Error('PublicBuildingNeed assetsMap is required');
        }

        super(config);
        this.excludePopulationFromMoneyAndConsumptionCalculation = config.excludePopulationFromMoneyAndConsumptionCalculation || false;

        // Explicit assignments
        this.level = level;

        this.checked(true);

        this.product = assetsMap.get(this.guid.toString());
        if (!this.product)
            throw `No Product ${this.guid}`;

        // Dummy assignment for late-initialized method
        this.initBans = dummyMethod('PublicBuildingNeed.initBans');

        // Call the real initialization method
        PopulationNeed.prototype.initHidden.bind(this)(assetsMap);
        this.initBans = PopulationNeed.prototype.initBans;
    }
}

/**
 * Represents a need that doesn't require a factory to produce
 * Used for goods that are obtained through other means (e.g., trade, special buildings)
 */
export class NoFactoryNeed extends PublicBuildingNeed {
    public isNoFactoryNeed: boolean;
    public amount: any;
    public factor: number = 1;
    public residentsInput: any;
    public residentsInputFactor: number = 1;

    /**
     * Creates a new NoFactoryNeed instance
     * @param config - Configuration object for the need
     * @param level - The population level this need belongs to
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, level: PopulationLevel, assetsMap: Map<string, any>) {
        super(config, level, assetsMap);
        
        // Explicit assignments
        this.level = level;
        this.isNoFactoryNeed = true;

        // Dummy assignments for late-initialized properties
        this.amount = dummyObservable<number>('NoFactoryNeed.amount');
        this.residentsInput = dummyComputed<number>('NoFactoryNeed.residentsInput');

        if (this.factor == null)
            this.factor = 1;

        // Call the real initialization method
        PopulationNeed.prototype.initAggregation.bind(this)(assetsMap);

        this.product.addNeed(this);
    }
}

/**
 * Represents a need for a specific population level
 * Manages consumption requirements for different population tiers
 */
export class PopulationNeed extends Need {
    public requiredBuildings: any;
    public requiredFloorLevel: any;
    public level: PopulationLevel;
    public residentsUnlockCondition: number;
    public banned: any;
    public isInactive: any;
    public residences: ResidenceBuilding[] = [];
    public hidden: any;
    public residenceNeeds: any;
    public addResidenceNeed: (need: ResidenceNeed) => void = () => {};
    public totalResidents: any;
    public region: any;
    public checked: any;
    public notes: any;
    public residenceNeedsSubscription: any;
    public locked?: any;
    public bannedSubscription: any;
    public unlockCondition?: any;

    /**
     * Creates a new PopulationNeed instance
     * @param config - Configuration object for the need
     * @param level - The population level this need belongs to
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, level: PopulationLevel, assetsMap: Map<string, any>) {
        // Validate required parameters
        if (!config) {
            throw new Error('PopulationNeed config is required');
        }
        if (!level) {
            throw new Error('PopulationNeed level is required');
        }
        if (!assetsMap) {
            throw new Error('PopulationNeed assetsMap is required');
        }

        super(config, assetsMap);
        this.requiredBuildings = config.requiredBuildings || null;
        this.requiredFloorLevel = config.requiredFloorLevel || null;
        this.excludePopulationFromMoneyAndConsumptionCalculation = config.excludePopulationFromMoneyAndConsumptionCalculation || false;
        
        // Explicit assignments
        this.level = level;

        this.residentsUnlockCondition = 0;
        if (this.unlockCondition && this.unlockCondition.populationLevel == level.guid)
            this.residentsUnlockCondition = this.unlockCondition.amount;

        // Dummy assignments for late-initialized properties
        this.banned = dummyObservable<boolean>('PopulationNeed.banned');
        this.isInactive = dummyObservable<boolean>('PopulationNeed.isInactive');
        this.hidden = dummyComputed<boolean>('PopulationNeed.hidden');
        this.residenceNeeds = dummyObservable<any[]>('PopulationNeed.residenceNeeds');
        this.addResidenceNeed = dummyMethod('PopulationNeed.addResidenceNeed');
        this.totalResidents = dummyComputed<number>('PopulationNeed.totalResidents');
        this.region = null;
        this.checked = dummyObservable<boolean>('PopulationNeed.checked');
        this.notes = dummyObservable<string>('PopulationNeed.notes');
        this.residenceNeedsSubscription = dummyComputed<void>('PopulationNeed.residenceNeedsSubscription');
        this.locked = dummyComputed<boolean>('PopulationNeed.locked');
        this.bannedSubscription = dummyComputed<void>('PopulationNeed.bannedSubscription');

        // Initialize methods that will be replaced later
        this.initHidden = dummyMethod('PopulationNeed.initHidden');
        this.initAggregation = dummyMethod('PopulationNeed.initAggregation');
        this.initBans = dummyMethod('PopulationNeed.initBans');

        // Call the real initialization methods
        this.initHidden(assetsMap);
        this.initAggregation(assetsMap);
    }

    /**
     * Initializes hidden state and residence relationships
     * @param assetsMap - Map of all available assets
     */
    initHidden(assetsMap: Map<string, any>): void {
        this.banned = ko.observable(false);
        this.isInactive = ko.observable(false);

        if (this.requiredBuildings) {
            this.residences = this.requiredBuildings.map((r: any) => assetsMap.get(r));

            this.hidden = ko.computed(() => {
                if (!this.available())
                    return true;

                for (var r of this.residences)
                    if (r.existingBuildings() > 0 || this.level.residence == r)
                        return false;

                return true;
            });
        } else {
            this.hidden = ko.computed(() => !this.available());
            this.residences = this.level.allResidences;
        }

        this.residenceNeeds = ko.observableArray([]);

        this.addResidenceNeed = function (need: ResidenceNeed) {
            this.residenceNeeds.push(need);
        }

        this.totalResidents = ko.pureComputed(() => {
            var sum = 0;
            for (var n of this.residenceNeeds()) {
                sum += n.residents();
            }

            return sum;
        });
    }

    /**
     * Initializes aggregation and computed observables
     * @param assetsMap - Map of all available assets
     */
    initAggregation(_assetsMap: Map<string, any>): void {
        this.region = this.level.region;        

        this.checked = ko.observable(true);

        this.notes = ko.observable("");   

        this.residenceNeedsSubscription = ko.computed(() => {
            var sum = 0;
            for (var n of this.residenceNeeds())
                sum += n.amount();

            this.amount(sum);
        });
    }

    /**
     * Initializes ban conditions and unlock requirements
     * @param level - The population level this need belongs to
     * @param assetsMap - Map of all available assets
     */
    initBans(level: PopulationLevel, assetsMap: Map<string, any>): void {
        if (this.unlockCondition) {
            var config = this.unlockCondition;
            this.locked = ko.computed(() => {
                if (!config || !view.settings.needUnlockConditions.checked())
                    return false;

                if (level.skyscraperLevels && typeof level.hasSkyscrapers === 'function' && level.hasSkyscrapers())
                    return false;

                if (config.populationLevel != level.guid) {
                    var l = assetsMap.get(config.populationLevel);
                    return l.residents() < config.amount;
                }

                if (level.residents() >= config.amount)
                    return false;

                var residence = level.residence.upgradedBuilding;
                while (residence) {
                    var l = residence.populationLevel;
                    var amount = l.residents();
                    if (amount > 0)
                        return false;

                    residence = residence.upgradedBuilding;
                }

                return true;
            }).extend({ deferred: true }); // deferred necessary for updating population level residents

            this.isInactive(this.locked());
            this.locked.subscribe((locked: boolean) => this.isInactive(locked));
        }

        this.bannedSubscription = ko.computed(() => {
            var checked = this.checked();
            this.banned(!checked || this.locked && this.locked());
        });
    }

    /**
     * Updates the amount based on population changes
     * @param population - The current population count
     */
    updateAmount(_population: number): void { }
}

/**
 * Represents a single residence effect entry
 * Contains information about how a residence effect modifies consumption
 */
class ResidenceEffectEntry {
    public guid: number;
    public product: Product;
    public consumptionModifier: number;
    public residents: number;
    public suppliedBy: Product[];

    /**
     * Creates a new ResidenceEffectEntry instance
     * @param config - Configuration object for the effect entry
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, assetsMap: Map<string, any>) {
        // Validate required parameters
        if (!config) {
            throw new Error('ResidenceEffectEntry config is required');
        }
        if (!config.guid) {
            throw new Error('ResidenceEffectEntry config.guid is required');
        }
        if (!assetsMap) {
            throw new Error('ResidenceEffectEntry assetsMap is required');
        }

        // Explicit assignments
        this.guid = parseInt(config.guid);
        this.product = assetsMap.get(this.guid.toString());
        this.consumptionModifier = config.consumptionModifier || 0;
        this.residents = config.residents || 0;
        this.suppliedBy = (config.suppliedBy || []).map((e: any) => assetsMap.get(e));
    }
}

/**
 * Represents a residence effect that modifies consumption and population
 * Contains multiple effect entries that apply to different products
 */
export class ResidenceEffect extends NamedElement {
    public allowStacking: boolean;
    public entries: ResidenceEffectEntry[];
    public effectsPerNeed: Map<string, ResidenceEffectEntry>;
    public residences: ResidenceBuilding[];
    public panoramaLevel?: number;

    /**
     * Creates a new ResidenceEffect instance
     * @param config - Configuration object for the effect
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, assetsMap: Map<string, any>) {
        // Validate required parameters
        if (!config) {
            throw new Error('ResidenceEffect config is required');
        }
        if (!config.effects || !Array.isArray(config.effects)) {
            throw new Error('ResidenceEffect config.effects array is required');
        }
        if (!config.residences || !Array.isArray(config.residences)) {
            throw new Error('ResidenceEffect config.residences array is required');
        }
        if (!assetsMap) {
            throw new Error('ResidenceEffect assetsMap is required');
        }

        super(config);
        
        this.allowStacking = config.allowStacking || false;
        this.entries = config.effects.map((e: any) => new ResidenceEffectEntry(e, assetsMap));
        this.effectsPerNeed = new Map();

        for (var effect of this.entries) {
            this.effectsPerNeed.set(effect.guid.toString(), effect);
        }

        this.residences = [];
        for (var residence of config.residences) {
            let r = assetsMap.get(residence);
            this.residences.push(r);
            r.addEffect(this);
        }
    }

    /**
     * Compares this residence effect with another for sorting
     * Expected usage: array.sort((a,b) => a.compare(b))
     * @param other - The other residence effect to compare with
     * @returns Comparison result for sorting
     */
    compare(other: ResidenceEffect): number {
        if (
            this.panoramaLevel != null &&
            other.panoramaLevel != null &&
            this.residences[0]?.populationLevel &&
            other.residences[0]?.populationLevel &&
            typeof this.residences[0].populationLevel !== 'string' &&
            typeof other.residences[0].populationLevel !== 'string'
        ) {
            const thisPop = this.residences[0].populationLevel as any;
            const otherPop = other.residences[0].populationLevel as any;
            return 10 * (otherPop.guid - thisPop.guid) + other.panoramaLevel - this.panoramaLevel;
        }

        if (this.panoramaLevel != null)
            return -1000;

        if (other.panoramaLevel != null)
            return 1000;

        return this.name().localeCompare(other.name());
    }
}

/**
 * Represents the coverage of a residence effect on a specific residence
 * Manages the percentage of a residence that is affected by an effect
 */
export class ResidenceEffectCoverage {
    public residence: ResidenceBuilding;
    public residenceEffect: ResidenceEffect;
    public coverage: any;

    /**
     * Creates a new ResidenceEffectCoverage instance
     * @param residence - The residence building
     * @param residenceEffect - The residence effect
     * @param coverage - The coverage percentage (0-1)
     */
    constructor(residence: ResidenceBuilding, residenceEffect: ResidenceEffect, coverage: number = 1) {
        // Validate required parameters
        if (!residence) {
            throw new Error('ResidenceEffectCoverage residence is required');
        }
        if (!residenceEffect) {
            throw new Error('ResidenceEffectCoverage residenceEffect is required');
        }

        // Explicit assignments
        this.residence = residence;
        this.residenceEffect = residenceEffect;
        this.coverage = ko.observable(coverage);
    }
}

/**
 * Represents the coverage of a specific residence effect entry
 * Links a residence effect coverage with a specific effect entry
 */
export class ResidenceEffectEntryCoverage {
    public residenceEffectCoverage: ResidenceEffectCoverage;
    public residenceEffectEntry: ResidenceEffectEntry;

    /**
     * Creates a new ResidenceEffectEntryCoverage instance
     * @param residenceEffectCoverage - The residence effect coverage
     * @param residenceEffectEntry - The residence effect entry
     */
    constructor(residenceEffectCoverage: ResidenceEffectCoverage, residenceEffectEntry: ResidenceEffectEntry) {
        // Validate required parameters
        if (!residenceEffectCoverage) {
            throw new Error('ResidenceEffectEntryCoverage residenceEffectCoverage is required');
        }
        if (!residenceEffectEntry) {
            throw new Error('ResidenceEffectEntryCoverage residenceEffectEntry is required');
        }

        // Explicit assignments
        this.residenceEffectCoverage = residenceEffectCoverage;
        this.residenceEffectEntry = residenceEffectEntry;
    }

    /**
     * Gets the number of residents affected by this effect entry
     * @returns Number of affected residents
     */
    getResidents(): number {
        return this.residenceEffectCoverage.coverage() * this.residenceEffectEntry.residents;
    }
}

/**
 * Manages a list of recipes for a specific building type
 * Handles recipe selection and creation for buildings that can produce multiple goods
 */
export class RecipeList extends NamedElement {
    public island: Island;
    public region?: any;
    public recipeBuildings: any[];
    public unusedRecipes: any;
    public selectedRecipe: any;
    public canCreate: any;
    public visible: any;

    /**
     * Creates a new RecipeList instance
     * @param list - Configuration object for the recipe list
     * @param assetsMap - Map of all available assets
     * @param island - The island this recipe list belongs to
     */
    constructor(list: any, assetsMap: Map<string, any>, island: Island) {
        // Validate required parameters
        if (!list) {
            throw new Error('RecipeList list is required');
        }
        if (!assetsMap) {
            throw new Error('RecipeList assetsMap is required');
        }
        if (!island) {
            throw new Error('RecipeList island is required');
        }

        super(list);
        
        // Explicit assignments
        this.island = island;
        this.region = assetsMap.get(list.region || '');

        // Dummy assignments for late-initialized properties
        this.recipeBuildings = [];
        this.unusedRecipes = dummyObservable<any[]>('RecipeList.unusedRecipes');
        this.selectedRecipe = dummyObservable<any>('RecipeList.selectedRecipe');
        this.canCreate = dummyComputed<boolean>('RecipeList.canCreate');
        this.visible = dummyComputed<boolean>('RecipeList.visible');

        // Initialize with default values
        this.unusedRecipes([]);
        this.selectedRecipe(null);

        this.canCreate = ko.pureComputed(() => {
            return this.unusedRecipes().length > 0;
        });

        this.visible = ko.pureComputed(() => {
            if (!this.available()) {
                return false;
            }
            return this.recipeBuildings.length > 0;
        });
    }

    /**
     * Creates a new recipe building instance
     */
    create(): void {
        if (!this.canCreate())
            return;

        this.selectedRecipe().existingBuildings(1);
    }
} 