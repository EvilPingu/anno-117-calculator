import { ACCURACY } from './util';
import { PopulationLevel, ResidenceBuilding, Workforce } from './population';
import { PopulationNeed, ResidenceEffectCoverage, ResidenceEffect } from './consumption';
import { Product, Demand } from './production';
import { Consumer, Factory } from './factories';

// Extend PopulationNeed interface with missing properties
interface PopulationNeedExtended extends PopulationNeed {
    guid: string;
    factory: any;
    amount: any;
    product: any;
}

// Extend Factory interface with missing properties
interface FactoryExtended extends Factory {
    extraGoodProductionAmount?: any;
    extraGoodFactor(): number;
}

// Extend ResidenceEffectCoverage interface with missing properties
interface ResidenceEffectCoverageExtended extends ResidenceEffectCoverage {
    residenceEffect: ResidenceEffect;
    residence: ResidenceBuilding;
    coverage(): number;
}

declare const ko: any;
declare const $: any;
declare const view: any;
declare const window: any;

/**
 * Manages dark mode functionality for the application
 * Handles theme switching and CSS class management
 */
export class DarkMode {
    public checked: any;
    public classAdditions: Record<string, string>;

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
            const stored = localStorage.getItem(id);
            if (stored != null)
                this.checked(parseInt(stored));

            this.checked.subscribe((val: boolean) => localStorage.setItem(id, val ? "1" : "0"));
        }
    }

    /**
     * Toggles the dark mode state
     */
    toggle(): void {
        this.checked(!this.checked());
    }

    /**
     * Applies or removes dark mode CSS classes based on current state
     */
    apply(): void {
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
    start(): void {
        view.settings.missingBuildingsHighlight.checked(true);
        view.settings.utilizeExistingFactories.checked(true);
        view.settings.needUnlockConditions.checked(true);
    }

    /**
     * Applies settings for the "Plan" view mode
     * Enables decimal precision and configures DLC settings for planning
     */
    plan(): void {
        view.settings.decimalsForBuildings.checked(true);

        for (var dlc of view.dlcs.values()) {
            dlc.checked(true);
        }

        for (var dlcIndex of [0, 2, 8, 11]) {
            var d = view.dlcsMap.get("dlc" + dlcIndex);
            if (d)
                d.checked(false);
        }
    }

    /**
     * Applies settings for the "Master" view mode
     * Enables all options and DLCs for advanced users
     */
    master(): void {
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
    public attributeName: string;
    public index: number;
    public name: string;
    public recipeName: string;
    public guid: string;
    public getRegionExtendedName: any;
    public editable: boolean;
    public region: string;
    public hotkey: string;
    public templates: Template[];
    public parentInstance: any;
    public instance: any;
    [key: string]: any; // Index signature for dynamic properties

    /**
     * Creates a new Template instance
     * @param asset - The asset to create a template for
     * @param parentInstance - The parent instance
     * @param attributeName - The name of the attribute in the parent
     * @param index - The index of this template in the parent's array
     */
    constructor(asset: any, parentInstance: any, attributeName: string, index: number) {
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
                this[attr] = val.map((a: any, index: number) => {
                    if (Template.applicable(asset)) {
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
     * @param asset - The asset to check
     * @returns True if the asset can be templated
     */
    static applicable(asset: any): boolean {
        return asset instanceof PopulationLevel ||
            asset instanceof Workforce ||
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
    public factory: any;
    public amount: any;
    public tree: any;
    public breadth: any;

    /**
     * Creates a new ProductionChainView instance
     * @param factory - The factory to create a chain for
     * @param amount - Optional amount to base calculations on
     */
    constructor(factory: any, amount: any = null) {
        // Validate required parameters
        if (!factory) {
            throw new Error('ProductionChainView factory is required');
        }

        // Explicit assignments
        this.factory = factory;
        this.amount = amount;

        this.tree = ko.pureComputed(() => {
            let traverse = (consumer: FactoryExtended | Consumer, amount: number): any => {
                    if (amount < ACCURACY)
                        return null;

                    if (!(consumer instanceof Factory)){
                        return {
                            'amount': amount,
                            'factory': consumer,
                            'buildings': amount / consumer.tpmin / consumer.boost(),
                            'children': consumer.inputDemands().map((d: any) => traverse(d.factory(), amount)).filter((d: any) => d)
                        }; 
                    }

                    var factory = consumer as FactoryExtended;

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
                        'children': factory.inputDemands().map((d: any) => traverse(d.factory(), inputAmount * d.factor)).filter((d: any) => d)
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

            var traverse = (node: any): number => Math.max(1, (node.children || []).map((n: any) => traverse(n)).reduce((a: number, b: number) => a + b, 0));

            return traverse(this.tree());
        })
    }
}

/**
 * Aggregates residence effect coverage data
 * Manages multiple coverage instances for the same residence effect
 */
class ResidenceEffectAggregate {
    public totalResidences: any;
    public residenceEffect: ResidenceEffect;
    public coverage: ResidenceEffectCoverageExtended[];
    public averageCoverage: any;

    /**
     * Creates a new ResidenceEffectAggregate instance
     * @param totalResidences - Total number of residences
     * @param residenceEffectCoverage - The initial coverage
     */
    constructor(totalResidences: any, residenceEffectCoverage: ResidenceEffectCoverageExtended) {
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
     * @param residenceEffectCoverage - The coverage to add
     */
    add(residenceEffectCoverage: ResidenceEffectCoverageExtended): void {
        this.coverage.push(residenceEffectCoverage);
    }

    /**
     * Finalizes the aggregate by computing average coverage
     */
    finishInitialization(): void {
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
    public heading: string;
    public residences: ResidenceBuilding[];
    public percentCoverage: any;
    public totalResidences: any;
    public consumedProducts: Set<any>;
    public allEffects: ResidenceEffect[];
    public aggregates: any;
    public unusedEffects: any;
    public need: PopulationNeed | null;
    public productionChain: ProductionChainView | null;
    public selectedEffect: any;
    public region: string | null = null;

    /**
     * Creates a new ResidenceEffectView instance
     * @param residences - Array of residences to manage effects for
     * @param heading - Optional heading for the view
     * @param need - Optional specific need to focus on
     */
    constructor(residences: ResidenceBuilding[], heading: string | null = null, need: PopulationNeed | null = null) {
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

        var effects = new Set<ResidenceEffect>();
        var aggregatesMap = new Map<ResidenceEffect, ResidenceEffectAggregate>();
        this.consumedProducts = new Set();
        this.residences.forEach(r => {
            (r.populationLevel as any).needsMap.forEach((n: PopulationNeedExtended) => {
                this.consumedProducts.add(n.product);
            });

            r.allEffects.forEach((e: ResidenceEffect) => {
                if (e.available() && (need == null || e.effectsPerNeed.has((need as PopulationNeedExtended).guid)))
                    effects.add(e);
            });

            r.effectCoverage().forEach((c: ResidenceEffectCoverageExtended) => {
                var e = c.residenceEffect;
                if (aggregatesMap.has(e)) {
                    aggregatesMap.get(e)!.add(c);
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
            this.productionChain = new ProductionChainView((need as PopulationNeedExtended).factory, (need as PopulationNeedExtended).amount);
        } else {
            this.productionChain = null;
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
    create(): void {
        var e = this.selectedEffect();
        var a: ResidenceEffectAggregate | null = null;
        e.residences.forEach((r: ResidenceBuilding) => {
            if (this.residences.indexOf(r) == -1)
                return;

            var c = new ResidenceEffectCoverage(r, e) as ResidenceEffectCoverageExtended;
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
     * @param aggregate - The aggregate to delete
     */
    delete(aggregate: ResidenceEffectAggregate): void {
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
    sort(): void {
        this.aggregates.sort((a: ResidenceEffectAggregate, b: ResidenceEffectAggregate) => a.residenceEffect.compare(b.residenceEffect));
        this.unusedEffects.sort((a: ResidenceEffect, b: ResidenceEffect) => a.compare(b));
    }

    /**
     * Applies the current configuration globally to all islands
     */
    applyConfigGlobally(): void {
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
    public id: string;
    public collapsed: any;

    /**
     * Creates a new Collapsible instance
     * @param id - Unique identifier for the collapsible section
     * @param collapsed - Initial collapsed state
     */
    constructor(id: string, collapsed: boolean) {
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
    public key: string;
    public collapsibles: any;
    public collapsiblesSubscription: any;

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
                let json = JSON.parse(localStorage.getItem(this.key) || '{}');
                for (var id in json)
                    this.collapsibles.push(new Collapsible(id, parseInt(json[id]) !== 0))
            } catch (e) {
                console.error(e);
            }

            this.collapsiblesSubscription = ko.computed(() => {
                var json: Record<string, number> = {};
                for (var c of this.collapsibles())
                    json[c.id] = c.collapsed() ? 1 : 0;

                localStorage.setItem(this.key, JSON.stringify(json));
            });
        }
    }

    /**
     * Gets or creates a collapsible state for the given ID
     * @param id - The unique identifier for the collapsible section
     * @param collapsed - Default collapsed state if creating new
     * @returns The collapsible state object
     */
    get(id: string, collapsed: boolean): Collapsible {
        for (var existingCollapsible of this.collapsibles())
            if (existingCollapsible.id == id)
                return existingCollapsible;

        var newCollapsible = new Collapsible(id, collapsed);
        this.collapsibles.push(newCollapsible);
        return newCollapsible;
    }
} 