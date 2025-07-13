// @ts-check
import { EPSILON, createFloatInput, NamedElement, Option } from './util.js'
import { Demand } from './production.js'
import { ResidenceBuilding } from './population.js';

var ko = require( "knockout" );

/**
 * Base class for all consumption needs in the game
 * Extends Demand to provide consumption-specific functionality
 */
export class Need extends Demand {
    /**
     * Creates a new Need instance
     * @param {Object} config - Configuration object for the need
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
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
    /**
     * Creates a new ResidenceNeed instance
     * @param {ResidenceBuilding} residence - The residence building this need belongs to
     * @param {PopulationNeed} need - The population need this residence need represents
     */
    constructor(residence, need) {
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
        
        this.substitution = ko.observable(0);
        this.fulfillment = ko.observable(this.need.checked() ? 1 : 0);

        if(this.need.amount){
            this.amount = ko.pureComputed(() => {
                var newspaper = (100 + window.view.newspaperConsumption.amount()) / 100;
                var total = this.residence.consumingLimit() * this.need.tpmin * newspaper;
                return total * (Math.max(0, this.fulfillment() - this.substitution()));
            });
        }

        this.need.addResidenceNeed(this);

        this.residentsPerHouse = ko.pureComputed(() => {
            var sum = this.residence.residentsPerNeed.get(this.need.guid) || 0;
            for (var c of this.residence.getConsumptionEntries(this.need)) {
                var coverage = c.residenceEffectCoverage.coverage();
                sum += coverage * (c.residenceEffectEntry.residents || 0);
            }
            return sum;
        });

        this.residents = ko.pureComputed(() => {
            var sum = this.residence.existingBuildings() * (this.residence.residentsPerNeed.get(this.need.guid) || 0);
            for (var c of this.residence.getConsumptionEntries(this.need)) {
                var coverage = c.residenceEffectCoverage.coverage();
                sum += Math.round(coverage * this.residence.existingBuildings()) *(c.residenceEffectEntry.residents || 0);
            }
            return Math.floor(sum * this.fulfillment());
        })
    }

    /**
     * Initializes dependencies and sets up subscriptions for this residence need
     * @param {Map} residenceNeedsMap - Map of all residence needs for this residence
     */
    initDependencies(residenceNeedsMap){
        this.residenceNeedsMap = residenceNeedsMap;
        this.substitutionSubscription = ko.computed(() => {
            /** @type [ResidenceEffectEntryCoverage] */
            var arr = this.residence.getConsumptionEntries(this.need);
            if(arr == null)
                return; // no effect for this product
            
            var suppliedByFulfillment = 0;
            var modifier = 0;
            for (var c of arr){
                var coverage = c.residenceEffectCoverage.coverage();
                modifier += c.residenceEffectEntry.consumptionModifier * coverage;
                for (/** @type Product */var p of c.residenceEffectEntry.suppliedBy){
                    var n = this.residenceNeedsMap.get(p.guid);

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
    /**
     * Creates a new PublicBuildingNeed instance
     * @param {Object} config - Configuration object for the need
     * @param {PopulationLevel} level - The population level this need belongs to
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, level, assetsMap) {
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

        this.product = assetsMap.get(this.guid);
        if (!this.product)
            throw `No Product ${this.guid}`;

        PopulationNeed.prototype.initHidden.bind(this)(assetsMap);
        this.initBans = PopulationNeed.prototype.initBans;
    }
}

/**
 * Represents a need that doesn't require a factory to produce
 * Used for goods that are obtained through other means (e.g., trade, special buildings)
 */
export class NoFactoryNeed extends PublicBuildingNeed {
    /**
     * Creates a new NoFactoryNeed instance
     * @param {Object} config - Configuration object for the need
     * @param {PopulationLevel} level - The population level this need belongs to
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, level, assetsMap) {
        super(config, level, assetsMap);
        
        // Explicit assignments
        this.level = level;
        this.isNoFactoryNeed = true;

        this.amount = ko.observable(0);
        if (this.factor == null)
            this.factor = 1;
       

        this.residentsInput = ko.pureComputed(() => {
            return this.amount() * this.residentsInputFactor;
        });

        PopulationNeed.prototype.initAggregation.bind(this)(assetsMap);

        this.product.addNeed(this);
    }
}

/**
 * Represents a need for a specific population level
 * Manages consumption requirements for different population tiers
 */
export class PopulationNeed extends Need {
    /**
     * Creates a new PopulationNeed instance
     * @param {Object} config - Configuration object for the need
     * @param {PopulationLevel} level - The population level this need belongs to
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, level, assetsMap) {
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

        this.initHidden(assetsMap);
        this.initAggregation(assetsMap);
    }

    /**
     * Initializes hidden state and residence relationships
     * @param {Map} assetsMap - Map of all available assets
     */
    initHidden(assetsMap){
        this.banned = ko.observable(false);
        this.isInactive = ko.observable(false);

        if (this.requiredBuildings) {
            this.residences = this.requiredBuildings.map(r => assetsMap.get(r));

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

        this.addResidenceNeed = function (need) {
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
     * @param {Map} assetsMap - Map of all available assets
     */
    initAggregation(assetsMap) {
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
     * @param {PopulationLevel} level - The population level this need belongs to
     * @param {Map} assetsMap - Map of all available assets
     */
    initBans(level, assetsMap) {
        if (this.unlockCondition) {
            var config = this.unlockCondition;
            this.locked = ko.computed(() => {
                if (!config || !view.settings.needUnlockConditions.checked())
                    return false;

                if (level.skyscraperLevels && level.hasSkyscrapers())
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
            this.locked.subscribe(locked => this.isInactive(locked));
        }

        this.bannedSubscription = ko.computed(() => {
            var checked = this.checked();
            this.banned(!checked || this.locked && this.locked());
        });
    }

    /**
     * Updates the amount based on population changes
     * @param {number} population - The current population count
     */
    updateAmount(population) { }
}

/**
 * Manages newspaper consumption effects and propaganda buffs
 * Handles the selection and application of newspaper effects
 */
export class NewspaperNeedConsumption {
    /**
     * Creates a new NewspaperNeedConsumption instance
     */
    constructor() {
        this.selectedEffects = ko.observableArray();
        this.allEffects = [];
        this.amount = ko.observable(100);
        this.selectedBuff = ko.observable(0);
        this.selectableBuffs = ko.observableArray();

        this.updateBuff();

        this.selectedEffects.subscribe(() => this.updateBuff());

        this.selectedEffects.subscribe(() => {
            if (this.selectedEffects().length > 3)
                this.selectedEffects.splice(0, 1)[0].checked(false);
        });

        this.amount = ko.computed(() => {
            var sum = 0;
            for (var effect of this.selectedEffects()) {
                sum += Math.ceil(effect.amount * (1 + parseInt(this.selectedBuff()) / 100));
            }

            return sum;
        });
    }

    /**
     * Adds a newspaper effect to the available effects list
     * @param {NewspaperNeedConsumptionEntry} effect - The effect to add
     */
    add(effect) {
        this.allEffects.push(effect);
        effect.checked.subscribe(checked => {
            var idx = this.selectedEffects.indexOf(effect);
            if (checked && idx != -1 || !checked && idx == -1)
                return;

            if (checked)
                this.selectedEffects.push(effect);
            else
                this.selectedEffects.remove(effect);
        });
    }

    /**
     * Updates the available buff options based on selected effects
     */
    updateBuff() {
        var influenceCosts = 0;
        for (var effect of this.selectedEffects()) {
            influenceCosts += effect.influenceCosts;
        }

        var threeSelected = this.selectedEffects().length >= 3;
        var selectedBuff = this.selectedBuff();

        this.selectableBuffs.removeAll();
        if (influenceCosts < 50)
            this.selectableBuffs.push(0);
        if (influenceCosts < 150 && (!threeSelected || !this.selectableBuffs().length))
            this.selectableBuffs.push(7);
        if (influenceCosts < 300 && (!threeSelected || !this.selectableBuffs().length))
            this.selectableBuffs.push(15);
        if (!threeSelected || !this.selectableBuffs().length)
            this.selectableBuffs.push(25);

        if (this.selectableBuffs.indexOf(selectedBuff) == -1)
            this.selectedBuff(this.selectableBuffs()[0]);
        else
            this.selectedBuff(selectedBuff);
    }

    /**
     * Applies the newspaper effects to the game state
     */
    apply() {
        
    }
}

/**
 * Represents a single newspaper consumption effect entry
 * Extends Option to provide selectable newspaper effects
 */
export class NewspaperNeedConsumptionEntry extends Option {
    /**
     * Creates a new NewspaperNeedConsumptionEntry instance
     * @param {Object} config - Configuration object for the effect
     */
    constructor(config) {
        // Validate required parameters
        if (!config) {
            throw new Error('NewspaperNeedConsumptionEntry config is required');
        }
        if (!config.articleEffects || !Array.isArray(config.articleEffects) || config.articleEffects.length === 0) {
            throw new Error('NewspaperNeedConsumptionEntry config.articleEffects array is required');
        }

        super(config);

        this.lockDLCIfSet(this.checked);

        this.amount = config.articleEffects[0].ArticleValue;

        this.visible = ko.pureComputed(() => this.available())
    }
}

/**
 * Represents a single residence effect entry
 * Contains information about how a residence effect modifies consumption
 */
class ResidenceEffectEntry {
    /**
     * Creates a new ResidenceEffectEntry instance
     * @param {Object} config - Configuration object for the effect entry
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
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
        this.product = assetsMap.get(this.guid);
        this.consumptionModifier = config.consumptionModifier || 0;
        this.residents = config.residents || 0;
        this.suppliedBy = (config.suppliedBy || []).map(e => assetsMap.get(e));
    }
}

/**
 * Represents a residence effect that modifies consumption and population
 * Contains multiple effect entries that apply to different products
 */
export class ResidenceEffect extends NamedElement {
    /**
     * Creates a new ResidenceEffect instance
     * @param {Object} config - Configuration object for the effect
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
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
        this.entries = config.effects.map(e => new ResidenceEffectEntry(e, assetsMap));
        this.effectsPerNeed = new Map();

        for (var effect of this.entries) {
            this.effectsPerNeed.set(effect.guid, effect);
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
     * @param {ResidenceEffect} other - The other residence effect to compare with
     * @returns {number} Comparison result for sorting
     */
    compare(other) {
        if (this.panoramaLevel != null && other.panoramaLevel != null)
            return 10 * (other.residences[0].populationLevel.guid - this.residences[0].populationLevel.guid) + other.panoramaLevel - this.panoramaLevel;

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
    /**
     * Creates a new ResidenceEffectCoverage instance
     * @param {ResidenceBuilding} residence - The residence building
     * @param {ResidenceEffect} residenceEffect - The residence effect
     * @param {number} coverage - The coverage percentage (0-1)
     */
    constructor(residence, residenceEffect, coverage = 1) {
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
export class ResidenceEffectEntryCoverage{
    /**
     * Creates a new ResidenceEffectEntryCoverage instance
     * @param {ResidenceEffectCoverage} residenceEffectCoverage - The residence effect coverage
     * @param {ResidenceEffectEntry} residenceEffectEntry - The residence effect entry
     */
    constructor(residenceEffectCoverage, residenceEffectEntry) {
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
     * @returns {number} Number of affected residents
     */
    getResidents() {
        return this.residenceEffectCoverage.coverage() * this.residenceEffectEntry.residents;
    }
}

/**
 * Manages a list of recipes for a specific building type
 * Handles recipe selection and creation for buildings that can produce multiple goods
 */
export class RecipeList extends NamedElement {
    /**
     * Creates a new RecipeList instance
     * @param {Object} list - Configuration object for the recipe list
     * @param {Map} assetsMap - Map of all available assets
     * @param {Island} island - The island this recipe list belongs to
     */
    constructor(list, assetsMap, island) {
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

        if (list.region)
            this.region = assetsMap.get(list.region);

        this.recipeBuildings = (list.recipeBuildings || []).map(r => {
            var a = assetsMap.get(r);
            a.recipeList = this;
            return a;
        });

        this.unusedRecipes = ko.computed(() => {
            var result = [];
            for (var recipe of this.recipeBuildings) {
                if (!recipe.existingBuildings())
                    result.push(recipe);
            }

            return result;
        });
        this.selectedRecipe = ko.observable(this.recipeBuildings[0]);

        this.canCreate = ko.pureComputed(() => {
            return this.unusedRecipes().length && this.selectedRecipe();
        });

        this.visible = ko.pureComputed(() => {
            if (!this.available())
                return false;

            return this.unusedRecipes().length != 0;
        });
    }

    /**
     * Creates a new recipe building instance
     */
    create() {
        if (!this.canCreate())
            return;

        this.selectedRecipe().existingBuildings(1);
    }
}
