// @ts-check
import { ACCURACY } from './util.js'
import { PopulationLevel, ResidenceBuilding, Workforce } from './population.js'
import { PopulationNeed, ResidenceEffect, ResidenceEffectCoverage } from './consumption.js'
import { ProductCategory, Product, Demand } from './production.js'
import { Consumer, Factory } from './factories.js'

var ko = require( "knockout" );

/**
 * Manages dark mode functionality for the application
 * Handles theme switching and CSS class management
 */
export class DarkMode {
    /**
     * Creates a new DarkMode instance
     * Initializes dark mode state and loads saved preference
     */
    constructor() {
        // Explicit assignments
        this.checked = ko.observable(false);

        this.classAdditions = {
            "body": "bg-dark",
            //".ui-fieldset legend, body": "text-light",
            //".form-control": "text-light bg-dark bg-darker",
            //".custom-select": "text-light bg-dark bg-darker",
            //".input-group-text, .modal-content": "bg-dark text-light",
            //".btn-default": "btn-dark btn-outline-light",
            //".btn-light": "btn-dark",
            //".ui-fchain-item": "bg-dark",
            //".card": "bg-dark"
        };

        this.checked.subscribe(() => this.apply());

        if (localStorage) {
            let id = "darkMode.checked";
            if (localStorage.getItem(id) != null)
                this.checked(parseInt(localStorage.getItem(id)));

            this.checked.subscribe(val => localStorage.setItem(id, val ? 1 : 0));
        }
    }

    /**
     * Toggles the dark mode state
     */
    toggle() {
        this.checked(!this.checked());
    }

    /**
     * Applies or removes dark mode CSS classes based on current state
     */
    apply() {
        if (this.checked())
            Object.keys(this.classAdditions).forEach((key) => $(key).addClass(this.classAdditions[key]));
        else
            Object.keys(this.classAdditions).reverse()
                .forEach((key) => $(key).removeClass(this.classAdditions[key]));
    }
}

/**
 * Manages different view modes for the application
 * Provides preset configurations for different user scenarios
 */
export class ViewMode {
    /**
     * Creates a new ViewMode instance
     */
    constructor() {
        // No explicit assignments needed for this constructor
    }

    /**
     * Applies settings for the "Start" view mode
     * Enables missing buildings highlight and other beginner-friendly features
     */
    start() {
        view.settings.missingBuildingsHighlight.checked(true);
        view.settings.utilizeExistingFactories.checked(true);
        view.settings.needUnlockConditions.checked(true);
    }

    /**
     * Applies settings for the "Plan" view mode
     * Enables decimal precision and configures DLC settings for planning
     */
    plan() {
        view.settings.decimalsForBuildings.checked(true);

        for (var dlc of view.dlcs.values()) {
            dlc.checked(true);
        }

        for (var dlc of [0, 2, 8, 11]) {
            var d = view.dlcsMap.get("dlc" + dlc);
            if (d)
                d.checked(false);
        }
    }

    /**
     * Applies settings for the "Master" view mode
     * Enables all options and DLCs for advanced users
     */
    master() {
        for (var option of view.settings.options)
            option.checked(true);

        view.settings.hideProductionBoost.checked(false);

        for (var dlc of view.dlcs.values()) {
            dlc.checked(true);
        }
    }
}

/**
 * Template system for creating hierarchical data structures
 * Manages parent-child relationships between assets and their instances
 */
export class Template {
    /**
     * Creates a new Template instance
     * @param {Object} asset - The asset to create a template for
     * @param {Object} parentInstance - The parent instance
     * @param {string} attributeName - The name of the attribute in the parent
     * @param {number} index - The index of this template in the parent's array
     */
    constructor(asset, parentInstance, attributeName, index) {
        // Validate required parameters
        if (!asset) {
            throw new Error('Template asset is required');
        }
        if (!parentInstance) {
            throw new Error('Template parentInstance is required');
        }
        if (!attributeName) {
            throw new Error('Template attributeName is required');
        }
        if (typeof index !== 'number') {
            throw new Error('Template index is required and must be a number');
        }

        // Explicit assignments
        this.attributeName = attributeName;
        this.index = index;

        this.name = asset.name;
        this.recipeName = asset.recipeName;
        this.guid = asset.guid;
        this.getRegionExtendedName = asset.getRegionExtendedName;
        this.editable = asset.editable;
        this.region = asset.region;
        this.hotkey = asset.hotkey;

        this.templates = [];
        this.parentInstance = ko.observable(parentInstance);

        this.instance = ko.computed(() => {
            var p = this.parentInstance();

            var inst = p[this.attributeName][this.index];

            this.templates.forEach(t => t.parentInstance(inst));

            return inst;
        });

        for (var attr in asset) {
            var val = asset[attr];

            if (val instanceof Array) {
                this[attr] = val.map((a, index) => {
                    if (Template.prototype.applicable(asset)) {
                        var t = new Template(a, this.instance(), attr, index);
                        this.templates.push(t);
                        return t;
                    } else
                        return a;
                });
            }
            else if (!ko.isObservable(val) && !ko.isComputed(val) && asset.hasOwnProperty(attr))
                this[attr] = val;
        }

    }

    /**
     * Checks if an asset type is applicable for templating
     * @param {Object} asset - The asset to check
     * @returns {boolean} True if the asset can be templated
     */
    applicable(asset) {
        return asset instanceof PopulationLevel ||
            asset instanceof Workforce ||
            asset instanceof ProductCategory ||
            asset instanceof Product ||
            asset instanceof Factory ||
            asset instanceof Demand;
    }
}

/**
 * Manages the display of production chains
 * Creates hierarchical tree structures for visualizing factory dependencies
 */
export class ProductionChainView {
    /**
     * Creates a new ProductionChainView instance
     * @param {ko.observable<Factory|Consumer>} factory - The factory to create a chain for
     * @param {ko.observable<number>|null} amount - Optional amount to base calculations on
     */
    constructor(factory, amount = null) {
        // Validate required parameters
        if (!factory) {
            throw new Error('ProductionChainView factory is required');
        }

        // Explicit assignments
        this.factory = factory;
        this.amount = amount;

        this.tree = ko.pureComputed(() => {
            let traverse = (/** @type Factory|Consumer */consumer, amount) => {
                    if (amount < ACCURACY)
                        return null;

                    if (!(consumer instanceof Factory)){
                        return {
                            'amount': amount,
                            'factory': consumer,
                            'buildings': amount / consumer.tpmin / consumer.boost(),
                            'children': consumer.inputDemands().map(d => traverse(d.factory(), amount)).filter(d => d)
                        }; 
                    }

                    var factory = /** @type Factory */ consumer;

                    var icon = null;
                    var maxSubAmount = factory.outputAmount ? factory.outputAmount() : factory.inputAmount();
                    if (factory.tradeList && factory.tradeList.amount() > maxSubAmount){
                        maxSubAmount = factory.tradeList.amount()
                        icon = "./icons/icon_shiptrade.png"
                    }
                    if (factory.extraGoodProductionAmount && factory.extraGoodProductionAmount() > maxSubAmount) {
                        maxSubAmount = factory.extraGoodProductionAmount()
                        icon = "./icons/icon_add_goods_socket_white.png"
                    } 
                    
                    if(icon){
                        return {
                            'amount': amount,
                            'factory': factory,
                            'children': [],
                            'icon': icon
                        }
                    }

                    var inputAmount = amount / factory.extraGoodFactor();
                    return {
                        'amount': amount,
                        'factory': factory,
                        'buildings': inputAmount / factory.tpmin / factory.boost(),
                        'children': factory.inputDemands().map(d => traverse(d.factory(), inputAmount * d.factor)).filter(d => d)
                    };           

            };

            var amount = this.amount;
            if (amount == null)
                amount = this.factory().outputAmount;
            if (amount == null)
                amount = this.factory().inputAmount;
            return traverse(this.factory(), amount());
             
        });

        this.breadth = ko.pureComputed(() => {
            if (this.tree() == null)
                return 0;

            var traverse = node => Math.max(1, (node.children || []).map(n => traverse(n)).reduce((a,b) => a +b, 0));

            return traverse(this.tree());
        })
    }
}

/**
 * Aggregates residence effect coverage data
 * Manages multiple coverage instances for the same residence effect
 */
class ResidenceEffectAggregate {
    /**
     * Creates a new ResidenceEffectAggregate instance
     * @param {ko.observable<number>} totalResidences - Total number of residences
     * @param {ResidenceEffectCoverage} residenceEffectCoverage - The initial coverage
     */
    constructor(totalResidences, residenceEffectCoverage) {
        // Validate required parameters
        if (!totalResidences) {
            throw new Error('ResidenceEffectAggregate totalResidences is required');
        }
        if (!residenceEffectCoverage) {
            throw new Error('ResidenceEffectAggregate residenceEffectCoverage is required');
        }

        // Explicit assignments
        this.totalResidences = totalResidences;
        this.residenceEffect = residenceEffectCoverage.residenceEffect;

        this.coverage = [residenceEffectCoverage];
    }

    /**
     * Adds another coverage instance to this aggregate
     * @param {ResidenceEffectCoverage} residenceEffectCoverage - The coverage to add
     */
    add(residenceEffectCoverage) {
        this.coverage.push(residenceEffectCoverage);
    }

    /**
     * Finalizes the aggregate by computing average coverage
     */
    finishInitialization() {
        this.averageCoverage = ko.pureComputed(() => {
            var sum = 0;
            this.coverage.forEach(coverage => { sum += coverage.residence.existingBuildings() * coverage.coverage(); });

            return sum / this.totalResidences();
        });
    }
}

/**
 * Manages the display and editing of residence effects
 * Provides interface for applying effects to residences
 */
export class ResidenceEffectView {
    /**
     * Creates a new ResidenceEffectView instance
     * @param {Array<ResidenceBuilding>} residences - Array of residences to manage effects for
     * @param {string} heading - Optional heading for the view
     * @param {PopulationNeed} need - Optional specific need to focus on
     */
    constructor(residences, heading = null, need = null) {
        // Validate required parameters
        if (!residences || !Array.isArray(residences)) {
            throw new Error('ResidenceEffectView residences array is required');
        }

        // Explicit assignments
        this.heading = heading || window.view.texts.needConsumption.name;
        this.residences = residences.filter(r => r.available());
        this.percentCoverage = ko.observable(100);

        this.totalResidences = ko.pureComputed(() => {
            var sum = 0;
            this.residences.forEach(r => { sum += r.existingBuildings(); });
            return sum;
        });

        var effects = new Set();
        var aggregatesMap = new Map();
        this.consumedProducts = new Set();
        this.residences.forEach(r => {
            r.populationLevel.needsMap.forEach(n => {
                this.consumedProducts.add(n.product);
            });

            r.allEffects.forEach((/** @type ResidenceEffect */ e) => {
                if (e.available() && (need == null || e.effectsPerNeed.has(need.guid)))
                    effects.add(e);
            });

            r.effectCoverage().forEach((/** @type ResidenceEffectCoverage */ c) => {
                var e = c.residenceEffect;
                if (aggregatesMap.has(e)) {
                    aggregatesMap.get(e).add(c);
                } else {
                    aggregatesMap.set(e, new ResidenceEffectAggregate(this.totalResidences, c));
                }
            })
        });

        this.allEffects = [...effects];        
        
        this.aggregates = ko.observableArray([]);
        aggregatesMap.forEach((a, e) => {
            a.finishInitialization();
            effects.delete(e);
            this.aggregates.push(a);
        });
        this.unusedEffects = ko.observableArray([...effects]);

        this.need = need;
        if (need instanceof PopulationNeed) {
            this.productionChain = new ProductionChainView(need.factory, need.amount);
        }

        this.sort();
        this.selectedEffect = ko.observable(this.unusedEffects()[0]);
        view.settings.language.subscribe(() => {
            this.sort();
        })
    }

    /**
     * Creates a new residence effect coverage
     * Applies the selected effect to the residences
     */
    create() {
        var e = this.selectedEffect();
        var a = null;
        e.residences.forEach(r => {
            if (this.residences.indexOf(r) == -1)
                return;

            var c = new ResidenceEffectCoverage(r, e, this.percentCoverage() / 100);
            r.addEffectCoverage(c);

            if (a == null) {

                a = new ResidenceEffectAggregate(this.totalResidences, c);
            } else {
                a.add(c);
            }
        });

        if (a != null) {
            this.unusedEffects.remove(e);
            this.aggregates.push(a);
            this.sort();
        }
    }

    /**
     * Deletes a residence effect aggregate
     * Removes the effect coverage from all affected residences
     * @param {ResidenceEffectAggregate} aggregate - The aggregate to delete
     */
    delete(aggregate) {
        aggregate.coverage.forEach(coverage => {
            coverage.residence.removeEffectCoverage(coverage);
        });

        this.unusedEffects.push(aggregate.residenceEffect);
        this.aggregates.remove(aggregate);
        this.sort();
        this.selectedEffect(aggregate.residenceEffect);
        this.percentCoverage(aggregate.coverage[0].coverage() * 100);
    }

    /**
     * Sorts the effects and aggregates by priority
     */
    sort() {
        this.aggregates.sort((a, b) => a.residenceEffect.compare(b.residenceEffect));
        this.unusedEffects.sort((a, b) => a.compare(b));
    }

    /**
     * Applies the current configuration globally to all islands
     */
    applyConfigGlobally() {
        for (var isl of view.islands()) {
            // region is null for allIslands
            if (this.region && isl.region && this.region != isl.region)
                continue;

            for (var r of this.residences)
                if (isl.assetsMap.has(r.guid))
                    isl.assetsMap.get(r.guid).applyEffects(r.serializeEffects());

        }
    }
}

/**
 * Manages the collapsed state of a collapsible section
 * Tracks whether a section is expanded or collapsed
 */
class Collapsible {
    /**
     * Creates a new Collapsible instance
     * @param {string} id - Unique identifier for the collapsible section
     * @param {boolean} collapsed - Initial collapsed state
     */
    constructor(id, collapsed) {
        // Validate required parameters
        if (!id) {
            throw new Error('Collapsible id is required');
        }

        // Explicit assignments
        this.id = id;
        this.collapsed = ko.observable(!!collapsed);
    }
}

/**
 * Manages the state of all collapsible sections in the application
 * Handles persistence and retrieval of collapsed states
 */
export class CollapsibleStates {
    /**
     * Creates a new CollapsibleStates instance
     * Initializes from localStorage if available
     */
    constructor() {
        // Explicit assignments
        this.key = "collapsibleStates";
        this.collapsibles = ko.observableArray([]);

        if (localStorage) {
            try {
                let json = JSON.parse(localStorage.getItem(this.key));
                for (var id in json)
                    this.collapsibles.push(new Collapsible(id, parseInt(json[id])))
            } catch (e) {
                console.error(e);
            }


            this.collapsiblesSubscription = ko.computed(() => {
                var json = {};
                for (var c of this.collapsibles())
                    json[c.id] = c.collapsed() ? 1 : 0;

                localStorage.setItem(this.key, JSON.stringify(json));
            });
        }
    }

    /**
     * Gets or creates a collapsible state for the given ID
     * @param {string} id - The unique identifier for the collapsible section
     * @param {boolean} collapsed - Default collapsed state if creating new
     * @returns {Collapsible} The collapsible state object
     */
    get(id, collapsed) {
        for (var c of this.collapsibles())
            if (c.id == id)
                return c;

        var c = new Collapsible(id, collapsed);
        this.collapsibles.push(c);
        return c;
    }
}