// @ts-check
import { EPSILON, NamedElement, Option } from './util.js'

var ko = require( "knockout" );

/**
 * Represents a product that can be produced by factories
 * Manages production relationships and factory assignments
 */
export class Product extends NamedElement {
    /**
     * Creates a new Product instance
     * @param {Object} config - Configuration object for the product
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
        super(config);

        //this.amount = ko.observable(0);

        this.factories = this.producers.map(p => assetsMap.get(p)).filter(p => !!p);
        this.availableFactories = ko.pureComputed(() => this.factories.filter(f => f.available()));

        this.fixedFactory = ko.observable(null);
        if (this.mainFactory)
            this.mainFactory = assetsMap.get(this.mainFactory);

        if (this.producers && this.factories.length) {
            //this.amount = ko.computed(() => this.factories.map(f => f.outputAmount()).reduce((a, b) => a + b));
            //this.lockDLCIfSet(this.amount); // if routes sum up to exactly zero, usage might still end up at 0.
        }

        this.visible = ko.pureComputed(() => this.available());
    }
}

/**
 * Represents a meta product that groups other products
 * Used for organizing products into categories
 */
export class MetaProduct extends NamedElement {
    /**
     * Creates a new MetaProduct instance
     * @param {Object} config - Configuration object for the meta product
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
        super(config);
    }
}

/**
 * Represents a product that doesn't require a factory to produce
 * Used for goods obtained through other means (e.g., trade, special buildings)
 */
export class NoFactoryProduct extends NamedElement {
    /**
     * Creates a new NoFactoryProduct instance
     * @param {Object} config - Configuration object for the product
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
        super(config);

        this.needs = ko.observableArray([]);
        this.amount = ko.computed(() => this.needs().map(n => n.amount()).reduce((a, b) => a + b, 0));
        this.lockDLCIfSet(this.amount);

        this.residentsInput = ko.pureComputed(() => {
            return this.amount() * this.residentsInputFactor;
        });

        this.visible = ko.computed(() => {
            return this.available() && this.amount() > 0;
        });
    }

    /**
     * Adds a need to this product
     * @param {Object} need - The need to add
     */
    addNeed(need) {
        this.needs.push(need);
    }
}

/**
 * Represents a demand for a product from a consumer
 * Manages the relationship between consumers and the products they need
 */
export class Demand extends NamedElement {
    /**
     * Creates a new Demand instance
     * @param {Object} config - Configuration object for the demand
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
        super(config);

        this.amount = ko.observable(0);
        if (this.factor == null)
            this.factor = 1;

        this.product = assetsMap.get(this.guid);
        if (!this.product)
            throw `No Product ${this.guid}`;
        this.factory = ko.observable(config.factory);

        if (this.product) {
            this.updateFixedProductFactory(this.product.fixedFactory());
            this.product.fixedFactory.subscribe(f => this.updateFixedProductFactory(f));
        }
    }

    /**
     * Updates the factory assigned to this demand
     * @param {Factory} f - The factory to assign
     */
    updateFixedProductFactory(f) {
        if (f == null && (this.consumer || this.region)) { // find factory in the same region as consumer
            let region = this.region || this.consumer.region;
            if (region && !(this.product.mainFactory && this.product.mainFactory.region === region)) {
                for (let fac of this.product.factories) {
                    if (fac.region === region) {
                        f = fac;
                        break;
                    }
                }
            }
        }

        if (f == null) // region based approach not successful
            f = this.product.mainFactory || this.product.factories[0];

        if (f != this.factory()) {
            if (this.factory())
                this.factory().remove(this);

            this.factory(f);
            f.add(this);
        }
    }

    /**
     * Updates the amount of this demand
     * @param {number} amount - The new amount
     */
    updateAmount(amount) {
        amount *= this.factor;
        if (Math.abs(this.amount() - amount) >= EPSILON)
            this.amount(amount);
    }
}

/**
 * Represents a category of products
 * Groups related products together for organization
 */
export class ProductCategory extends NamedElement {
    /**
     * Creates a new ProductCategory instance
     * @param {Object} config - Configuration object for the category
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
        super(config);
        this.products = config.products.map(p => assetsMap.get(p)).filter(p => p != null && p instanceof Product);
    }
}

/**
 * Represents an item that can be equipped to factories
 * Provides bonuses and modifications to factory production
 */
export class Item extends NamedElement {
    /**
     * Creates a new Item instance
     * @param {Object} config - Configuration object for the item
     * @param {Map} assetsMap - Map of all available assets
     * @param {Region} region - The region this item belongs to
     */
    constructor(config, assetsMap, region) {
        super(config);

        if (this.replaceInputs) {
            this.replacements = new Map();
            this.replacementArray = [];

            this.replaceInputs.forEach(r => {
                this.replacementArray.push({
                    old: assetsMap.get(r.OldInput),
                    new: assetsMap.get(r.NewInput)
                });
                this.replacements.set(r.OldInput, r.NewInput);
            });
        }

        this.factories = this.factories.map(f => assetsMap.get(f)).filter(f => !!f);

        if (this.additionalOutputs) {
            this.extraGoods = [];
            for (var p of this.additionalOutputs) {
                if (p.ForceProductSameAsFactoryOutput)
                    for (var f of this.factories)
                        this.extraGoods.push(assetsMap.get(f.getOutputs()[0].Product));
                else {
                    p = assetsMap.get(p.Product);
                    if (p)
                        this.extraGoods.push(p);
                }
            }
            this.availableExtraGoods = ko.pureComputed(() => this.extraGoods.filter(p => p.available()));
        }

        if (this.replacingWorkforce)
            this.replacingWorkforce = assetsMap.get(this.replacingWorkforce);

        this.equipments =
            this.factories.map(f => new EquippedItem({ item: this, factory: f, icon: this.icon, locaText: this.locaText, dlcs: config.dlcs }, assetsMap));
        this.availableEquipments = ko.pureComputed(() => this.equipments.filter(e => e.factory.available()));

        this.checked = ko.pureComputed({
            read: () => {
                for (var eq of this.equipments)
                    if (!eq.checked())
                        return false;

                return true;
            },
            write: (checked) => {
                this.equipments.forEach(e => e.checked(checked));
            }
        });

        this.visible = ko.computed(() => {
            if (!this.available() || this.availableEquipments().length == 0)
                return false;

            if (this.availableExtraGoods && this.availableExtraGoods().length == 0)
                return false;

            if (!view.island || !view.island())
                return true;

            var region = view.island().region;
            if (!region)
                return true;

            for (var f of this.factories)
                if (f.region === region)
                    return true;

            return false;
        });
    }
}

/**
 * Represents an item equipped to a specific factory
 * Manages the relationship between items and factories
 */
class EquippedItem extends Option {
    /**
     * Creates a new EquippedItem instance
     * @param {Object} config - Configuration object for the equipped item
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
        super(config);

        this.lockDLCIfSet(this.checked);

        this.replacements = config.item.replacements;
        this.replacementArray = config.item.replacementArray;
        this.replacingWorkforce = config.item.replacingWorkforce;

        if (config.item.additionalOutputs) {
            this.extraGoods = []
            for (var cfg of config.item.additionalOutputs) {
                try {
                    var config = $.extend(true, {}, cfg, { item: this, factory: this.factory });
                    this.extraGoods.push(new ExtraGoodProduction(config, assetsMap));
                } catch (e) { }
            }
        }

        this.factory.items.push(this);

        this.visible = ko.pureComputed(() => {
            if (!this.available())
                return false;

            if (!view.island || !view.island())
                return true;

            var region = view.island().region;
            if (!region)
                return true;

            return this.factory.region === region;
        });
    }
}

/**
 * Represents additional goods production from equipped items
 * Manages extra goods produced by factories with specific items
 */
class ExtraGoodProduction {
    /**
     * Creates a new ExtraGoodProduction instance
     * @param {Object} config - Configuration object for the extra good production
     * @param {Map} assetsMap - Map of all available assets
     */
    constructor(config, assetsMap) {
        this.item = config.item;
        this.factory = config.factory;

        var product = config.ForceProductSameAsFactoryOutput ? config.factory.getOutputs()[0].Product : config.Product;
        this.product = assetsMap.get(product);
        if (!this.product)
            throw "Product " + product + " not found";

        this.additionalOutputCycle = config.AdditionalOutputCycle;
        this.Amount = config.Amount;

        this.amount = ko.computed(() => !!this.item.checked() * config.Amount * (this.factory.clipped && this.factory.clipped() ? 2 : 1) * this.factory.inputAmount() / this.additionalOutputCycle);

        for (var f of this.product.factories) {
            f.extraGoodProductionList.entries.push(this);

            if (f == this.factory)
                f.extraGoodProductionList.selfEffecting.push(this);
        }
    }
}

/**
 * Manages a list of extra goods production for a factory
 * Handles the collection and calculation of additional goods production
 */
export class ExtraGoodProductionList {
    /**
     * Creates a new ExtraGoodProductionList instance
     * @param {Factory} factory - The factory this list belongs to
     */
    constructor(factory) {
        this.factory = factory;

        this.checked = ko.observable(true);
        this.selfEffecting = ko.observableArray();

        this.entries = ko.observableArray();
        this.nonZero = ko.computed(() => {
            return this.entries().filter(i => i.amount());
        });
        this.amount = ko.computed(() => {
            var total = 0;
            for (var i of (this.entries() || []))
                if (this.selfEffecting.indexOf(i) == -1) // self effects considered in factory.extraGoodFactor
                    total += i.amount();

            return total;
        });
        this.amountWithSelf = ko.computed(() => {
            var total = 0;
            for (var i of (this.entries() || []))
                total += i.amount();

            return total;
        })
    }
}

