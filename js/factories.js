// @ts-check
import { ACCURACY, EPSILON, createIntInput, createFloatInput, NamedElement } from './util.js'
import { Workforce, WorkforceDemand } from './population.js'
import { ExtraGoodProductionList, Demand} from './production.js'
import { TradeList, ContractList } from './trade.js'

var ko = require("knockout");

/**
 * Base class for all consumers in the game
 * Represents buildings that consume goods and require workforce
 */
export class Consumer extends NamedElement {
    /**
     * Creates a new Consumer instance
     * @param {Object} config - Configuration object for the consumer
     * @param {Map} assetsMap - Map of all available assets
     * @param {Island} island - The island this consumer belongs to
     */
    constructor(config, assetsMap, island) {
        // Validate required parameters
        if (!config) {
            throw new Error('Consumer config is required');
        }
        if (!assetsMap) {
            throw new Error('Consumer assetsMap is required');
        }
        if (!island) {
            throw new Error('Consumer island is required');
        }

        super(config);
        this.isFactory = false;
        this.inputs = config.inputs || [];
        this.maintenances = config.maintenances || [];
        this.tpmin = config.tpmin || 0;
        this.forceRegionExtendedName = config.forceRegionExtendedName || false;

        this.island = island;

        if (config.region)
            this.region = assetsMap.get(config.region);

        this.items = [];
        this.inputDemandsMap = new Map();
        this.inputDemands = ko.observableArray([]);
        this.workforceDemand = null;

        this.boost = ko.observable(1);
        this.editable = ko.observable(false);
        this.existingBuildings = createIntInput(0, 0).extend({ deferred: true });
        this.lockDLCIfSet(this.existingBuildings);

        this.useinputAmountByExistingBuildings = ko.observable(true);
        this.inputAmountByOutput = ko.observable(0);

        this.inputAmountByExistingBuildings = ko.computed(() => {
            return this.existingBuildings() * this.boost() * this.tpmin;
        });

        this.inputAmount = ko.pureComputed(() => {
            var amount = this.inputAmountByOutput();
            if (this.useinputAmountByExistingBuildings())
                amount = Math.max(amount, this.inputAmountByExistingBuildings());
            return amount;
        });

        this.buildings = ko.computed(() => this.inputAmount() / this.tpmin / this.boost()).extend({ deferred: true });
        this.lockDLCIfSet(this.buildings);
        
        this.notes = ko.observable("");
    }

    /**
     * Gets the input requirements for this consumer
     * @returns {Array} Array of input requirements
     */
    getInputs() {
        return this.inputs || [];
    }

    /**
     * References products and sets up input demands
     * @param {Map} assetsMap - Map of all available assets
     */
    referenceProducts(assetsMap) {
        if (this.inputs)
            this.inputs.forEach(i => i.product = assetsMap.get(i.Product));
        this.availableItems = ko.pureComputed(() => this.items.filter(i => i.available()));

        this.inputDemandsSubscription = ko.computed(() => {
            if (!this.inputs)
                return;

            var amount = this.inputAmount();

            var inputs = new Map();
            this.inputs.forEach(i => { inputs.set(i.Product, i.Amount) });
            var items = this.items.filter(item => item.replacements && item.checked()).sort((a, b) => a.item.guid - b.item.guid);
            for (var item of items) {
                for (var replacement of item.replacements) {
                    if (inputs.has(replacement[0])) {
                        var factor = inputs.get(replacement[0]);
                        inputs.delete(replacement[0]);
                        if (replacement[1])
                            inputs.set(replacement[1], factor);
                    }
                }
            }

            var map = new Map();
            var demands = [];
            for (var guid of inputs.keys()) {
                var p = assetsMap.get(guid);

                if (p.isAbstract)
                    continue;

                var d = this.inputDemandsMap.get(guid)
                if (d) {
                    map.set(guid, d);
                    demands.push(d)
                    this.inputDemandsMap.delete(guid);
                    d.updateAmount(amount);
                } else {
                    d = new Demand({
                        guid: guid,
                        consumer: this,
                        factor: inputs.get(guid),
                    }, assetsMap);
                    d.updateAmount(amount);
                    demands.push(d);
                    map.set(guid, d);
                }
            }

            for (var d of this.inputDemandsMap.values())
                d.factory().remove(d);

            this.inputDemandsMap = map;
            this.inputDemands(demands);
        });
    }

    /**
     * Creates workforce demand for this consumer
     * @param {Map} assetsMap - Map of all available assets
     * @returns {WorkforceDemand|null} The created workforce demand or null
     */
    createWorkforceDemand(assetsMap) {
        for (let m of this.maintenances || []) {
            let a = assetsMap.get(m.Product);
            if (a instanceof Workforce) {
                this.workforceDemand = new WorkforceDemand(
                    this, 
                    a,
                    m.Amount || 0,
                    m.percentBoost || 100
                );

                this.workforceDemandSubscription = ko.computed(() => {
                    // for workforce replacement, the last applied item matters
                    let items = this.items.filter(item => item.replacingWorkforce && item.replacingWorkforce != a && item.checked()).sort((a, b) => b.item.guid - a.item.guid);
                    if(items.length)
                        this.workforceDemand.updateWorkforce(items[0].replacingWorkforce)
                    else
                        this.workforceDemand.updateWorkforce(null);
                });
                this.buildings.subscribe(val => this.workforceDemand.updateAmount(Math.max(val, this.buildings())));
            }
        }
        return null;
    }

    /**
     * Gets the extended name including region information
     * @returns {string} The extended name
     */
    getRegionExtendedName() {
        if (!this.forceRegionExtendedName && (!this.region || !this.product || this.product.factories.length <= 1))
            return this.name();

        return `${this.name()} (${this.region.name()})`;
    }

    /**
     * Gets the icon for this consumer
     * @returns {string} The icon path
     */
    getIcon() {
        return this.icon;
    }

    /**
     * Updates the amount for this consumer
     */
    updateAmount() {
    }

    /**
     * Applies configuration globally to all islands
     */
    applyConfigGlobally() {
        for (var isl of view.islands()) {
            if (this.region && isl.region && this.region != isl.region)
                continue;

            var other = isl.assetsMap.get(this.guid);

            for (var i = 0; i < this.items.length; i++)
                other.items[i].checked(this.items[i].checked());

            if (this.workforceDemand && this.workforceDemand.percentBoost)
                other.workforceDemand.percentBoost(this.workforceDemand.percentBoost());
        }
    }
}

/**
 * Represents a module that can be attached to factories
 * Extends Consumer to provide module-specific functionality
 */
export class Module extends Consumer {
    /**
     * Creates a new Module instance
     * @param {Object} config - Configuration object for the module
     * @param {Map} assetsMap - Map of all available assets
     * @param {Island} island - The island this module belongs to
     */
    constructor(config, assetsMap, island) {
        super(config, assetsMap, island);
        
        this.additionalOutputCycle = config.additionalOutputCycle || null;
        this.productivityUpgrade = config.productivityUpgrade || 0;
        this.workforceAmountUpgrade = config.workforceAmountUpgrade || null;

        // Explicit assignments
        this.checked = ko.observable(false);
        this.lockDLCIfSet(this.checked);
        this.visible = ko.pureComputed(() => !!config && this.available());
    }
}

/**
 * Represents a public consumer building
 * Extends Consumer to provide public building-specific functionality
 */
export class PublicConsumerBuilding extends Consumer {
    /**
     * Creates a new PublicConsumerBuilding instance
     * @param {Object} config - Configuration object for the building
     * @param {Map} assetsMap - Map of all available assets
     * @param {Island} island - The island this building belongs to
     */
    constructor(config, assetsMap, island) {
        super(config, assetsMap, island);

        // Explicit assignments
        this.forceRegionExtendedName = config.forceRegionExtendedName || false;
        this.needs = [];

        this.visible = ko.computed(() => {
            if (!this.available())
                return false;

            if (this.region && this.island.region && this.region != this.island.region)
                return false;

            return true;
        });
    }
}

/**
 * Represents a power plant building
 * Extends PublicConsumerBuilding to provide power plant-specific functionality
 */
export class PowerPlant extends PublicConsumerBuilding {
    /**
     * Creates a new PowerPlant instance
     * @param {Object} config - Configuration object for the power plant
     * @param {Map} assetsMap - Map of all available assets
     * @param {Island} island - The island this power plant belongs to
     */
    constructor(config, assetsMap, island) {
        super(config, assetsMap, island);

        // Explicit assignments
        this.percentBoost = createIntInput(100, 1);
        this.percentBoost.subscribe((val) => {
            this.boost(val / 100);
        });
    }

    /**
     * Applies configuration globally to all islands
     */
    applyConfigGlobally() {
        super.applyConfigGlobally();

        for (var isl of view.islands()) {
            if (this.region && isl.region && this.region != isl.region)
                continue;

            var other = isl.assetsMap.get(this.guid);

            // only update new attributes of this child classe
            other.percentBoost(this.percentBoost());
        }
    }
}

/**
 * Represents a buff that can be applied to buildings
 * Provides buff-specific functionality for production bonuses
 */
export class Buff extends NamedElement {
    /**
     * Creates a new Buff instance
     * @param {Object} config - Configuration object for the buff
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
        // Validate required parameters
        if (!config) {
            throw new Error('Buff config is required');
        }
        if (!assetsMap) {
            throw new Error('Buff assetsMap is required');
        }

        super(config);

        // Explicit assignments for properties not already assigned in NamedElement
        this.additionalOutputCycle = config.additionalOutputCycle || null;
        this.amount = config.amount || 0;
        this.factory = config.factory || null;
        this.product = config.product || null;
        
        this.visible = ko.pureComputed(() => this.available());
    }
}

/**
 * Represents a factory that produces goods
 * Extends Consumer to provide factory-specific functionality
 */
export class Factory extends Consumer {
    /**
     * Creates a new Factory instance
     * @param {Object} config - Configuration object for the factory
     * @param {Map} assetsMap - Map of all available assets
     * @param {Island} island - The island this factory belongs to
     */
    constructor(config, assetsMap, island) {
        super(config, assetsMap, island);
        
        // Explicit assignments
        this.isFactory = true;
        this.canClip = config.canClip || false;
        this.outputs = config.outputs || [];
        this.demands = ko.observableArray([]);

        this.tradeList = new TradeList(island, this);

        if (params.tradeContracts && (!this.island.region || this.island.region.guid == 5000000))
            this.contractList = new ContractList(island, this);

        this.extraGoodProductionList = new ExtraGoodProductionList(this);

        // use the history to break the cycle: extra good (lumberjack) -> building materials need (timber) -> production (sawmill) -> production (lumberjack)
        // that cycles between two values by adding a damper
        // [[prev val, timestamp], [prev prev val, timestamp]]
        this.extraGoodProductionHistory = [];
        this.extraGoodProductionAmount = ko.pureComputed(() => {
            var val = this.extraGoodProductionList.checked() ? this.extraGoodProductionList.amount() : 0;

            if (this.extraGoodProductionHistory.length && Math.abs(val - this.extraGoodProductionHistory[0][0]) < ACCURACY)
                return this.extraGoodProductionHistory[0][0];

            var time = new Date();

            if (this.extraGoodProductionHistory.length >= 2) {
                // after initialization, we have this.extraGoodProductionHistory = [val, 0]
                // when the user manually sets it to 0, the wrong value is propagated
                // restrict to cycles triggered by automatic updates, i.e. update interval < 200 ms
                if (Math.abs(this.extraGoodProductionHistory[1][0] - val) < ACCURACY && this.extraGoodProductionHistory[1][0] !== 0 && time.getTime() - this.extraGoodProductionHistory[1][1].getTime() < 200)
                    val = (val + this.extraGoodProductionHistory[0][0]) / 2;
            }

            this.extraGoodProductionHistory.unshift([val, time]);
            if (this.extraGoodProductionHistory.length > 2)
                this.extraGoodProductionHistory.pop();
            return val;
        }).extend({ deferred: true });

        this.totalDemands = ko.pureComputed(() => {
            var sum = 0;
            this.demands().forEach(d => {
                sum += d.amount();
            });

            sum += this.tradeList.inputAmount();

            if (this.contractList)
                sum += this.contractList.inputAmount();

            return sum;
        });

        this.externalProduction = ko.pureComputed(() => {
            var sum = 0;

            sum += this.tradeList.outputAmount();
            sum += this.extraGoodProductionAmount();

            if (this.contractList)
                sum += this.contractList.outputAmount();

            return sum;
        });

        this.inputAmountByExtraGoods = ko.observable(0);

        this.percentBoost = createIntInput(100, 1);
        this.percentBoost.subscribe((val) => {
            this.boost(val / 100);
        });

        if (config.canClip)
            this.clipped = ko.observable(false);

        if (config.module) {
            this.module = assetsMap.get(config.module);
            this.moduleChecked = ko.observable(false);
            this.module.lockDLCIfSet(this.moduleChecked);
            var workforceUpgrade = this.module.workforceAmountUpgrade ? this.module.workforceAmountUpgrade.Value : 0;
            this.moduleChecked.subscribe(checked => {
                if (checked) {
                    this.percentBoost(parseInt(this.percentBoost()) + this.module.productivityUpgrade);
                    if (this.workforceDemand)
                        this.workforceDemand.percentBoost(this.workforceDemand.percentBoost() + workforceUpgrade);
                } else {
                    var val = Math.max(1, parseInt(this.percentBoost()) - this.module.productivityUpgrade);
                    this.percentBoost(val);

                    if (this.workforceDemand)
                        this.workforceDemand.percentBoost(Math.max(0, this.workforceDemand.percentBoost() - workforceUpgrade));
                }
            });
            this.moduleExtraGoods = ko.pureComputed(() => this.moduleChecked() ? this.inputAmount() / this.module.additionalOutputCycle : 0);
            //moduleDemand created in this.referenceProducts
        }

        if (config.fertilizerModule) {
            this.fertilizerModule = assetsMap.get(config.fertilizerModule);
            this.fertilizerModuleChecked = ko.observable(false);
            this.fertilizerModule.lockDLCIfSet(this.fertilizerModuleChecked);
            this.fertilizerModuleChecked.subscribe(checked => {
                if (checked) {
                    this.percentBoost(parseInt(this.percentBoost()) + this.fertilizerModule.productivityUpgrade);
                } else {
                    var val = Math.max(1, parseInt(this.percentBoost()) - this.fertilizerModule.productivityUpgrade);
                    this.percentBoost(val);
                }
            });
            this.fertilizerModuleExtraGoods = ko.pureComputed(() => this.fertilizerModuleChecked() ? this.inputAmount() / this.fertilizerModule.additionalOutputCycle : 0);
            //fertilizerModuleDemand created in this.referenceProducts
        }

        if (config.palaceBuff) {
            this.palaceBuff = assetsMap.get(config.palaceBuff);
            this.palaceBuffChecked = ko.observable(false);
            this.palaceBuff.lockDLCIfSet(this.palaceBuffChecked);

            this.palaceBuffExtraGoods = ko.pureComputed(() => {
                if (!this.palaceBuffChecked())
                    return 0;
                var f = this.clipped && this.clipped() ? 2 : 1;
                return f * this.inputAmount() / this.palaceBuff.additionalOutputCycle;
            });
        }

        if (config.setBuff) {
            this.setBuff = assetsMap.get(config.setBuff);
            this.setBuffChecked = ko.observable(false);
            this.setBuff.lockDLCIfSet(this.setBuffChecked);

            this.setBuffExtraGoods = ko.pureComputed(() => {
                if (!this.setBuffChecked())
                    return 0;
                return this.inputAmount() / this.setBuff.additionalOutputCycle;
            });
        }

        this.extraGoodFactor = ko.computed(() => {
            var factor = 1;

            for (var m of ["module", "fertilizerModule"]) {
                var module = this[m];
                var checked = this[m + "Checked"];

                if (module && checked() && module.additionalOutputCycle)
                    factor += 1 / module.additionalOutputCycle;
            }

            if (this.palaceBuff && this.palaceBuffChecked())
                factor += (this.clipped && this.clipped() ? 2 : 1) / this.palaceBuff.additionalOutputCycle;

            if (this.setBuff && this.setBuffChecked())
                factor += 1 / this.setBuff.additionalOutputCycle;

            if (this.extraGoodProductionList && this.extraGoodProductionList.selfEffecting && this.extraGoodProductionList.checked())
                for (var e of this.extraGoodProductionList.selfEffecting())
                    if (e.item.checked())
                        factor += (this.clipped && this.clipped() ? 2 : 1) * (e.Amount || 1) / e.additionalOutputCycle;

            return factor;
        });

        this.outputAmount = ko.pureComputed(() => {
            var diff = Math.max(this.inputAmountByExtraGoods() * this.extraGoodFactor(), 
                this.totalDemands() - this.externalProduction(),
                this.useinputAmountByExistingBuildings() ? this.inputAmountByExistingBuildings() * this.extraGoodFactor() : 0);
            return diff > EPSILON ? diff : 0;
        });

        this.substitutableOutputAmount = ko.pureComputed(() => Math.max(0, this.totalDemands() - this.externalProduction() - Math.max(this.inputAmountByExtraGoods(), this.inputAmountByExistingBuildings()) * this.extraGoodFactor()));
        this.isHighlightedAsMissing = ko.pureComputed(() => {
            if (!view.settings.missingBuildingsHighlight.checked())
                return false;

            return this.buildings() > this.existingBuildings() + ACCURACY;
        });

        this.requiredInputAmountSubscription = ko.computed(() => {
            this.inputAmountByOutput(this.outputAmount() / this.extraGoodFactor());
        });

        this.useInputAmountByExistingBuildingsSubscription = ko.computed(() => {
            this.useinputAmountByExistingBuildings(this.editable() || view.settings.utilizeExistingFactories.checked());
        });
        
        if (this.workforceDemand)
            this.buildings.subscribe(val => this.workforceDemand.updateAmount(Math.max(val, this.buildings())));

        this.overProduction = ko.pureComputed(() => Math.max(0, this.inputAmount() * this.extraGoodFactor() + this.externalProduction() - this.totalDemands()));
        if(this.extraGoodProductionList)
            this.extraGoodsDisplayAmount = ko.pureComputed(() => this.extraGoodProductionList.checked() ? this.extraGoodProductionList.nonZero().reduce((a, b) => a + b.amount(), 0) : 0)

        this.visible = ko.computed(() => {
            if (!this.available())
                return false;

            if (Math.abs(this.inputAmount()) > EPSILON ||
                this.totalDemands() > EPSILON ||
                this.externalProduction() > EPSILON ||
                this.existingBuildings() > 0 ||
                this.extraGoodProductionList.amount() > EPSILON)
                return true;

            if (this.region && this.island.region && this.region != this.island.region)
                return false;

            if (view.settings.showAllConstructableFactories.checked())
                return true;

            if (this.editable()) {
                if (this.region && this.island.region)
                    return this.region === this.island.region;

                if (!this.region || this.region.guid === 5000000)
                    return true;

                return false;
            }

            return false;
        });
    }

    /**
     * Gets the output products for this factory
     * @returns {Array} Array of output products
     */
    getOutputs() {
        return this.outputs || [];
    }

    /**
     * References products and sets up factory-specific relationships
     * @param {Map} assetsMap - Map of all available assets
     */
    referenceProducts(assetsMap) {
        super.referenceProducts(assetsMap);
        this.getOutputs().forEach(i => i.product = assetsMap.get(i.Product));

        this.product = this.getProduct();
        if (!this.icon)
            this.icon = this.product.icon;

        for (var m of ["module", "fertilizerModule"]) {
            var module = this[m];

            if (module) {
                this[m + "Demand"] = new Demand({ 
                    guid: module.getInputs()[0].Product, 
                    consumer: this, 
                    module: module 
                }, assetsMap);
            }
        }

        this.buildingSubscription = ko.computed(() => {
            var b = Math.ceil(this.buildings() - ACCURACY);

            if (view.settings.utilizeExistingFactories.checked())
                b = Math.max(b, this.existingBuildings());

            if (this.workforceDemand)
                this.workforceDemand.updateAmount(b);

            for (var m of ["module", "fertilizerModule"]) {
                var module = this[m];
                var checked = this[m + "Checked"];
                var demand = this[m + "Demand"];

                if (module)
                    if (checked())
                        demand.updateAmount(b * module.tpmin);
                    else
                        demand.updateAmount(0);
            }
        });
    }

    /**
     * Gets the primary product produced by this factory
     * @returns {Product|null} The primary product or null
     */
    getProduct() {
        return this.getOutputs()[0] ? this.getOutputs()[0].product : null;
    }

    /**
     * Gets the icon for this factory
     * @returns {string} The icon path
     */
    getIcon() {
        return this.getProduct() ? this.getProduct().icon : super.getIcon();
    }

    /**
     * Increments the number of buildings while maintaining productivity
     */
    incrementBuildings() {
        if (this.buildings() <= 0 || parseInt(this.percentBoost()) <= 1)
            return;

        var minBuildings = Math.ceil(this.buildings() * parseInt(this.percentBoost()) / (parseInt(this.percentBoost()) - 1));
        let nextBoost = Math.ceil(parseInt(this.percentBoost()) * this.buildings() / minBuildings)
        this.percentBoost(Math.min(nextBoost, parseInt(this.percentBoost()) - 1));
    }

    /**
     * Decrements the number of buildings while maintaining productivity
     */
    decrementBuildings() {
        let currentBuildings = Math.ceil(this.buildings() * 100) / 100;
        var nextBuildings = Math.floor(currentBuildings);
        if (nextBuildings <= 0)
            return;

        if (currentBuildings - nextBuildings < 0.01)
            nextBuildings = Math.floor(nextBuildings - 0.01);
        var nextBoost = Math.ceil(100 * this.boost() * this.buildings() / nextBuildings);
        if (nextBoost - parseInt(this.percentBoost()) < 1)
            nextBoost = parseInt(this.percentBoost()) + 1;
        this.percentBoost(nextBoost);
    }

    /**
     * Increments the productivity boost percentage
     */
    incrementPercentBoost() {
        this.percentBoost(parseInt(this.percentBoost()) + 1);
    }

    /**
     * Decrements the productivity boost percentage
     */
    decrementPercentBoost() {
        this.percentBoost(parseInt(this.percentBoost()) - 1);
    }

    /**
     * Adds a demand to this factory
     * @param {Demand} demand - The demand to add
     */
    add(demand) {
        this.demands.push(demand);
        this.updateAmount();
    }

    /**
     * Removes a demand from this factory
     * @param {Demand} demand - The demand to remove
     */
    remove(demand) {
        this.demands.remove(demand);
        this.updateAmount();
    }

    /**
     * Applies configuration globally to all islands
     */
    applyConfigGlobally() {
        for (var isl of view.islands()) {
            if (this.region && isl.region && this.region != isl.region)
                continue;

            var other = isl.assetsMap.get(this.guid);

            for (var i = 0; i < this.items.length; i++)
                other.items[i].checked(this.items[i].checked());

            if (this.clipped)
                other.clipped(this.clipped());

            for (var m of ["module", "fertilizerModule"]) {
                var checked = this[m + "Checked"];
                if (checked())
                    other[m + "Checked"](checked());
            }

            if (this.palaceBuffChecked)
                other.palaceBuffChecked(this.palaceBuffChecked());

            if (this.setBuffChecked)
                other.setBuffChecked(this.setBuffChecked());

            if (this.workforceDemand && this.workforceDemand.percentBoost)
                other.workforceDemand.percentBoost(this.workforceDemand.percentBoost());

            // set boost after modules
            other.percentBoost(this.percentBoost());
        }
    }
}
