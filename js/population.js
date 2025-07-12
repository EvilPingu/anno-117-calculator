// @ts-check
import { ACCURACY, EPSILON, delayUpdate, createIntInput, createFloatInput, NamedElement } from './util.js'
import { MetaProduct, NoFactoryProduct, Product } from './production.js'
import { NoFactoryNeed, PopulationNeed, PublicBuildingNeed, ResidenceEffectCoverage, ResidenceEffectEntryCoverage, ResidenceNeed } from './consumption.js'
import { ResidenceEffectView} from './views.js'

var ko = require( "knockout" );

/**
 * Represents a residence building that houses population
 * Manages population counts, effects, and consumption needs
 */
export class ResidenceBuilding extends NamedElement {
    /**
     * Creates a new ResidenceBuilding instance
     * @param {Object} config - Configuration object for the residence building
     * @param {Map} assetsMap - Map of all available assets
     * @param {Island} island - The island this residence belongs to
     */
    constructor(config, assetsMap, island) {
        super(config);
        this.island = island;

        this.region = assetsMap.get(config.region)

        this.existingBuildings = createIntInput(0, 0);
        this.lockDLCIfSet(this.existingBuildings);

        this.allEffects = new Map();
        this.effectCoverage = ko.observableArray([]);
        this.panoramaCoverage = ko.pureComputed(() => {
            var sum = 0;
            for (/** @type ResidenceEffectCoverage */var effect of this.effectCoverage())
                if (effect.residenceEffect.panoramaLevel != null)
                    sum += effect.coverage();
            return sum;
        });

        this.residentsPerNeed = new Map();
        for (var guid in config.residentsPerNeed)
            this.residentsPerNeed.set(parseInt(guid), config.residentsPerNeed[guid]);

        this.entryCoveragePerProduct = ko.pureComputed(() => {
            var result = new Map();
            for (var coverage of this.effectCoverage())
                for (/** @type {ResidenceEffectCoverage} */var entry of coverage.residenceEffect.entries){
                    if(result.has(entry.product))
                        result.get(entry.product).push(new ResidenceEffectEntryCoverage(coverage, entry))
                    else
                        result.set(entry.product, [new ResidenceEffectEntryCoverage(coverage, entry)])
                }

            return result;
        });
        
        this.consumingLimit = null;
        this.needsMap = null;
        this.residenceNeedsMap = null;
        this.residents = ko.observable(0);
    }

    /**
     * Initializes needs and sets up computed observables
     * @param {Map} needsMap - Map of all needs for this residence
     */
    initializeNeeds(needsMap){
        this.needsMap = needsMap;
        this.consumingLimit = ko.pureComputed(() => {
            var sum = 0;
            for (var n of this.needsMap.values()){
                if(!n.available() || n.excludePopulationFromMoneyAndConsumptionCalculation)
                    continue;

                sum += this.existingBuildings() * (this.residentsPerNeed.get(n.guid) || 0);
                
                for (/** @type [ResidenceEffectEntryCoverage] */ const entry of this.getConsumptionEntries(n))
                    sum += this.existingBuildings() * entry.getResidents();
            }

            return sum;
        });

        this.residenceNeedsMap = new Map();
        this.residentsPerNeed.forEach((_, guid) => {
            var n = this.needsMap.get(guid); // some residence needs come from buff but have no need in population level
            if(n)
                this.residenceNeedsMap.set(guid, new ResidenceNeed(this, n));
        });

        this.residenceNeedsMap.forEach(n => n.initDependencies(this.residenceNeedsMap));
        this.residentsSubscription = ko.computed(() => {
            var sum = 0;
            for (var n of this.residenceNeedsMap.values()) {
                if (!n.residents)
                    console.log(n);
                sum += n.residents();
            }

            this.residents(sum);
        });
    }

    /**
     * Adds an effect to this residence
     * @param {ResidenceEffect} effect - The effect to add
     */
    addEffect(effect) {
        this.allEffects.set(effect.guid, effect);
    }

    /**
     * Adds effect coverage to this residence
     * @param {ResidenceEffectCoverage} effectCoverage - The effect coverage to add
     */
    addEffectCoverage(effectCoverage) {
        this.effectCoverage.push(effectCoverage);
        this.sortEffectCoverage();
    }

    /**
     * Removes effect coverage from this residence
     * @param {ResidenceEffectCoverage} effectCoverage - The effect coverage to remove
     */
    removeEffectCoverage(effectCoverage) {
        this.effectCoverage.remove(effectCoverage);
    }

    /**
     * Sorts effect coverage by priority
     */
    sortEffectCoverage() {
        this.effectCoverage.sort((a, b) => a.residenceEffect.compare(b.residenceEffect));
    }

    /**
     * Gets the number of residents that don't consume goods
     * @returns {number} Number of non-consuming residents
     */
    getNoConsumptionResidents() {
        var residents = 0;

        for (var [guid, res] of this.residentsPerNeed) {
            var need = this.populationLevel.needsMap.get(guid);
            if (need && need.available() &&
                need.excludePopulationFromMoneyAndConsumptionCalculation &&
                (need.requiredBuildings == null || need.requiredBuildings.indexOf(this.guid) != -1))
                residents += res;
        }

        return residents * this.existingBuildings();
    }

    /**
     * Gets consumption entries for a specific need
     * @param {Product|ResidenceNeed|Need} need - The need to get entries for
     * @returns {[ResidenceEffectEntryCoverage]} Array of consumption entries
     */
    getConsumptionEntries(need) {
        if (!(need instanceof Product)) {
            if (need instanceof ResidenceNeed)
                need = need.need;

            need = need.product;
        }

        return this.entryCoveragePerProduct().get(need) || [];
    }

    /**
     * Serializes effects to JSON for storage
     * @returns {Object} Serialized effects data
     */
    serializeEffects() {
        var coverageMap = {};
        for (var coverage of this.effectCoverage())
            coverageMap[coverage.residenceEffect.guid] = coverage.coverage();

        return coverageMap;
    }

    /**
     * Applies effects from JSON data
     * @param {Object} json - Serialized effects data
     */
    applyEffects(json) {
        var coverage = [];
        for (var guid in json) {
            var e = this.allEffects.get(parseInt(guid));

            if (e == null)
                continue;

            coverage.push(new ResidenceEffectCoverage(this, e, parseFloat(json[guid])));
        }
        this.effectCoverage.removeAll();
        this.effectCoverage(coverage);
        this.sortEffectCoverage();
    }

    /**
     * Prepares the residence effect view for this residence
     */
    prepareResidenceEffectView() {
        view.selectedResidenceEffectView(new ResidenceEffectView([this], this.name));
    }
}

/**
 * Represents a population level with specific needs and requirements
 * Manages population counts, needs, and residence buildings
 */
export class PopulationLevel extends NamedElement {
    /**
     * Creates a new PopulationLevel instance
     * @param {Object} config - Configuration object for the population level
     * @param {Map} assetsMap - Map of all available assets
     * @param {Island} island - The island this population level belongs to
     */
    constructor(config, assetsMap, island) {
        super(config);
        this.island = island

        this.hotkey = ko.observable(null);

        this.needs = [];
        this.buildingNeeds = [];
        this.basicNeeds = [];
        this.luxuryNeeds = [];
        this.lifestyleNeeds = [];
        this.needsMap = new Map();
        this.region = assetsMap.get(config.region);

        this.allResidences = [];
        this.notes = ko.observable("");

        if (this.residence) {
            this.residence = assetsMap.get(this.residence);
            this.residence.populationLevel = this;
            this.allResidences.push(this.residence);
        }

        if (config.skyscraperLevels) {
            this.skyscraperLevels = config.skyscraperLevels.map(l => assetsMap.get(l));
            this.skyscraperLevels.forEach(l => l.populationLevel = this);
            this.allResidences = this.allResidences.concat(this.skyscraperLevels);
        }
        if (config.specialResidence) {
            this.specialResidence = assetsMap.get(config.specialResidence);
            this.specialResidence.populationLevel = this;
            this.allResidences.push(this.specialResidence);
        }
        this.availableResidences = ko.pureComputed(() => this.allResidences.filter(r => r.available()));

        this.canEdit = ko.pureComputed(() => {
            for (var i = 1; i < this.allResidences.length; i++)
                if (this.allResidences[i].existingBuildings() > 0)
                    return false;

            return true;
        });

        this.existingBuildings = ko.computed({
            read: () => {
                var sum = 0;
                for (var r of this.allResidences)
                    sum += r.existingBuildings();

                return sum;
            },

            write: val => {
                if(this.canEdit())
                   this.residence.existingBuildings(val);
            }
        });

        // Set up needs
        config.needs.forEach(n => {
            var need;
            var product = assetsMap.get(n.guid);

            if (n.tpmin > 0 && product && !(product instanceof MetaProduct)) {
                need = product instanceof NoFactoryProduct ? new NoFactoryNeed(n, this, assetsMap) : new PopulationNeed(n, this, assetsMap);
                this.needs.push(need);
            } else {
                need = new PublicBuildingNeed(n, this, assetsMap);
                this.buildingNeeds.push(need);
            }

            if (n.isBonusNeed || n.excludePopulationFromMoneyAndConsumptionCalculation) {
                need.checked(false);
                for (var dlc of (need.dlcs || []))
                    dlc.checked.subscribe(checked => {
                        if (!checked)
                            need.checked(false);
                    });

                this.lifestyleNeeds.push(need);
                this.needsMap.set(need.guid, need);
                return;
            }

            if (n.residents || n.requiredFloorLevel)
                this.basicNeeds.push(need);
            else
                this.luxuryNeeds.push(need);
            this.needsMap.set(need.guid, need);
        });

        this.hasBonusNeeds = ko.pureComputed(() => {
            for (var n of this.lifestyleNeeds || [])
                if (!n.hidden())
                    return true;

            return false;
        });

        this.allResidences.forEach(r => r.initializeNeeds(this.needsMap));
        this.residents = ko.pureComputed(() => {
            var sum = 0;
            for (var r of this.allResidences)
                sum += r.residents();

            return sum;
        });
        this.residentsInput = ko.pureComputed({
            read: () => formatNumber(this.residents()),
            write: val => {
                val = parseInt(val.replace(/[^\d]/g, ""));
                if (!this.canEdit() || !isFinite(val) || val < 0) {
                    this.residentsInput.notifySubscribers();
                    return;
                }
                
                var perHouse = 0;

                for (var n of this.residence.residenceNeedsMap.values()) {
                    if (n.need.residentsUnlockCondition && val < n.need.residentsUnlockCondition)
                        continue;

                    var fulfillment = n.need.checked() ? 1 : n.substitution();

                    perHouse += fulfillment * this.residence.residentsPerNeed.get(n.need.guid);
                    for (var c of this.residence.getConsumptionEntries(n)) {
                        var coverage = c.residenceEffectCoverage.coverage();
                        perHouse += coverage * fulfillment * (c.residenceEffectEntry.residents || 0);
                    }
                }

                var buildings = Math.round(val / perHouse);
                if (buildings !== this.residence.existingBuildings())
                    this.residence.existingBuildings(buildings);
                else
                    this.residentsInput.notifySubscribers();
            }
        }).extend({ deferred: true }); // deferred necessary for updating population level residents

        if (this.skyscraperLevels || this.specialResidence) {
            // ensure that the value for the population level and those summed over the buildings match
            // the observables are only used for change propagation, the up-to-date values are available via the functions
            this.getFloorsSummedExistingBuildings = () => {
                var specialResidence = this.specialResidence ? this.specialResidence.existingBuildings() : 0;
                var levelSum = this.skyscraperLevels ? this.skyscraperLevels.map(s => s.existingBuildings()).reduce((a, b) => a + b) : 0;
                return specialResidence + levelSum;
            };
            this.floorsSummedExistingBuildings = ko.computed(() => this.getFloorsSummedExistingBuildings());

            this.hasSkyscrapers = () => this.getFloorsSummedExistingBuildings() ;

            this.canEditPerHouse = ko.pureComputed(() => {
                return !this.hasSkyscrapers() && !(this.specialResidence && this.specialResidence.existingBuildings());
            });
        } else {
            this.hasSkyscrapers = () => false;

            this.canEditPerHouse = ko.pureComputed(() => {
                return true;
            });
        }

        this.visible = ko.pureComputed(() => {
            if (!this.available())
                return false;

            if (!view.island || !view.island())
                return true;

            var region = view.island().region;
            if (!region)
                return true;

            return this.region === region;
        });
    }

    /**
     * Initializes ban conditions for all needs
     * @param {Map} assetsMap - Map of all available assets
     */
    initBans(assetsMap) {
        for (var n of this.needs.concat(this.buildingNeeds))
            n.initBans(this, assetsMap);
    }

    /**
     * Gets the number of residents that don't consume goods
     * @returns {number} Number of non-consuming residents
     */
    getNoConsumptionResidents() {
        var residents = 0;
        for (var r of this.allResidences)
            residents += r.getNoConsumptionResidents();

        return residents;
    }

    /**
     * Increments the population amount
     */
    incrementAmount() {
        this.residents(parseFloat(this.residents()) + 1);
    }

    /**
     * Decrements the population amount
     */
    decrementAmount() {
        this.residents(parseFloat(this.residents()) - 1);
    }

    /**
     * Applies configuration globally to all islands
     */
    applyConfigGlobally() {
        for (var isl of view.islands()) {
            // region is null for allIslands
            if (this.region && isl.region && this.region != isl.region)
                continue;

            var other = isl.assetsMap.get(this.guid);

            for (var r of this.allResidences)
                if (isl.assetsMap.has(r.guid))
                    isl.assetsMap.get(r.guid).applyEffects(r.serializeEffects());

            for (var guid of this.needsMap.keys())
                other.needsMap.get(guid).checked(this.needsMap.get(guid).checked());
        }
    }

    /**
     * Prepares the residence effect view for this population level
     * @param {PopulationNeed} need - Optional specific need to focus on
     */
    prepareResidenceEffectView(need = null) {
        var heading = this.name;
        if (need)
            heading = ko.pureComputed(() => this.name() + ": " + need.product.name());
        view.selectedResidenceEffectView(new ResidenceEffectView(this.allResidences, heading, need));
    }
}

/**
 * Represents commuter workforce that can work across multiple islands
 * Manages workforce that travels between islands
 */
export class CommuterWorkforce extends NamedElement {
    /**
     * Creates a new CommuterWorkforce instance
     * @param {Object} config - Configuration object for the commuter workforce
     * @param {Session} session - The session this workforce belongs to
     */
    constructor(config, session) {
        super(config);

        this.session = session;

        this.amount = ko.pureComputed(() => {
            var amount = 0;

            for (var isl of this.session.islands()) {
                if (isl.commuterPier.checked())
                    amount += isl.assetsMap.get(this.guid).amount();
            }

            return amount;
        });

        this.visible = ko.pureComputed(() => {
            if (!this.available())
                return false;

            return this.amount() != 0;
        });
    }
}

/**
 * Represents a workforce type that can be assigned to buildings
 * Manages workforce demands and availability
 */
export class Workforce extends NamedElement {
    /**
     * Creates a new Workforce instance
     * @param {Object} config - Configuration object for the workforce
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
        super(config);
        this.demands = ko.observableArray([]);

        this.amount = ko.pureComputed(() => {
            var sum = 0;
            for (var d of this.demands())
                sum += d.amount();

            return sum;
        });

        this.visible = ko.pureComputed(() => {
            if (!this.available())
                return false;

            return this.amount() != 0;
        });
    }

    /**
     * Adds a demand to this workforce
     * @param {WorkforceDemand} demand - The demand to add
     */
    add(demand) {
        this.demands.push(demand);
    }

    /**
     * Removes a demand from this workforce
     * @param {WorkforceDemand} demand - The demand to remove
     */
    remove(demand){
        this.demands.remove(demand);
    }
}

/**
 * Represents a workforce demand for a specific building
 * Manages the workforce requirements for individual buildings
 */
export class WorkforceDemand extends NamedElement {
    /**
     * Creates a new WorkforceDemand instance
     * @param {Object} config - Configuration object for the workforce demand
     */
    constructor(config) {
        super(config);
        this.buildings = 0;

        this.amount = ko.observable(0);
        this.percentBoost = createIntInput(100, 0);
        this.percentBoost.subscribe(val => {
            this.updateAmount(this.buildings);
        });

        /** @type KnockoutObservable<Workforce> */
        this.workforce = ko.observable(config.workforce);
        this.defaultWorkforce = config.workforce;
        this.workforce().add(this);
    }

    /**
     * Updates the workforce type for this demand
     * @param {Workforce|null} workforce - The new workforce type, or null to use default
     */
    updateWorkforce(workforce = null){
        if(workforce == null)
            workforce = this.defaultWorkforce;

        if (workforce !== this.workforce()){
            this.workforce().remove(this);
            this.workforce(workforce);
            this.workforce().add(this);
        }
    }

    /**
     * Updates the amount based on the number of buildings
     * @param {number} buildings - The number of buildings
     */
    updateAmount(buildings) {
        this.buildings = buildings;

        var perBuilding = Math.ceil(this.Amount * this.percentBoost() / 100);
        this.amount(Math.ceil(buildings) * perBuilding);
    }
}

