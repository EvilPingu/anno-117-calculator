import { ACCURACY, BuildingsCalc, EPSILON, formatNumber, ko } from './util';
import { AppliedBuff, Product, ProductCategory } from './production';
import { Factory, Module } from './factories';
import { Island, Region } from './world';
import { Supplier } from './suppliers';
import { TradeRoute, TradeList } from './trade';
import { ProductionChainView } from './views';

declare const $: any;
declare const view: any;

/**
 * Option for supplier selection dropdown
 */
export interface SupplierOption {
    type: 'factory' | 'extra_good' | 'passive_trade';
    supplier: Supplier;
    label: string;
    icon: string;
}

/**
 * Presenter for individual factory within ProductPresenter
 * Provides factory-specific UI bindings and supplier management
 */
export class FactoryPresenter {
    public factory: Factory;
    public parentProduct: ProductPresenter;
    public instance: KnockoutComputed<Factory>;
    public island: KnockoutObservable<Island>;

    // Delegated properties
    public guid: KnockoutComputed<string>;
    public name: KnockoutComputed<string>;
    public region: KnockoutComputed<Region>;
    public buildings: KnockoutComputed<BuildingsCalc>;
    public boost: KnockoutComputed<number>;
    public outputAmount: KnockoutComputed<number>;
    public modules: KnockoutComputed<Module[]>;
    public items: KnockoutComputed<AppliedBuff[]>;
    public visible: KnockoutComputed<boolean>;
    public isDefaultSupplier: KnockoutComputed<boolean>;
    public tradeList: KnockoutComputed<TradeList | undefined>;
    public productionChain: ProductionChainView;
    

    /**
     * Creates a new FactoryPresenter instance
     * @param factory - The factory to present
     * @param parent - Parent ProductPresenter
     */
    constructor(factory: Factory, parent: ProductPresenter) {
        if (!factory) {
            throw new Error('FactoryPresenter factory is required');
        }
        if (!parent) {
            throw new Error('FactoryPresenter parent is required');
        }

        this.factory = factory;
        this.parentProduct = parent;
        this.island = parent.island;        
        this.instance = ko.computed(() => this.island().assetsMap.get(this.factory.guid));
        

        // Delegate to factory observables
        this.guid = ko.pureComputed(() => this.instance().guid);
        this.name = ko.pureComputed(() => this.instance().name());
        this.region = ko.pureComputed(() => this.instance().associatedRegions[0]);
        this.buildings = ko.pureComputed(() => this.instance().buildings);
        this.boost = ko.pureComputed(() => this.instance().boost());
        this.outputAmount = ko.pureComputed(() => this.instance().outputAmount());
        this.modules = ko.pureComputed(() => this.instance().modules);
        this.items = ko.pureComputed(() => this.instance().availableItems());

        this.visible = ko.computed(() => {
            if (!this.instance().available())
                return false;

            if (this.island().region.id != "Meta" && this.region() != this.island().region)
                return false;

            return true;
        });

        this.isDefaultSupplier = ko.pureComputed(() =>
            this.parentProduct.defaultSupplier() === this.factory
        );

        this.tradeList = ko.pureComputed(() => {
            const product = this.factory.getProduct();
            return product ? product.tradeList : undefined;
        });

        this.productionChain = new ProductionChainView(this.instance, this.outputAmount);
    }

    /**
     * Sets this factory as the default supplier for the parent product
     */
    setAsDefaultSupplier(): void {
        this.parentProduct.instance().updateDefaultSupplier(this.factory);
    }

    outputAmountFormatted(): string {
        return formatNumber(this.outputAmount()).toString() + ' t/min';
    }
}

/**
 * Presenter for Product - provides product-level UI bindings and supplier management
 * Single presenter per product, aggregates all factories producing that product
 */
export class ProductPresenter {
    // === CORE PROPERTIES ===
    public instance: KnockoutComputed<Product>;
    public product: Product;
    public island: KnockoutObservable<Island>;
    public guid: number;

    // === FACTORY PRESENTERS ===
    public factoryPresenters: FactoryPresenter[];
    public visibleFactories: KnockoutComputed<FactoryPresenter[]>;

    // === SUPPLIER MANAGEMENT ===
    public availableSuppliers: KnockoutComputed<SupplierOption[]>;
    public defaultSupplier: KnockoutComputed<Supplier | null>;
    public selectedSupplierOption: KnockoutObservable<SupplierOption | null>;

    // === ISLAND SELECTION FOR TRADE ROUTES ===
    public availableTradeIslands: KnockoutComputed<Island[]>;
    public selectedTradeIsland: KnockoutObservable<Island | null>;
    public tradeRouteExport: KnockoutObservable<boolean>;
    public tradeRouteAmount: KnockoutObservable<number>;

    // === AGGREGATE CALCULATIONS ===
    public totalProduction: KnockoutComputed<number>;
    public totalDemand: KnockoutComputed<number>;
    public netBalance: KnockoutComputed<number>;

    // === TRADE ROUTE MANAGEMENT ===
    public tradeList: KnockoutComputed<TradeList>;

    // === UI STATE ===
    public visible: KnockoutComputed<boolean>;
    public regionIconVisible: KnockoutComputed<boolean>;
    public isHighlightedAsMissing: KnockoutComputed<boolean>;
    public name: KnockoutComputed<string>;
    public icon: KnockoutComputed<string>;
    public region: KnockoutComputed<Region | undefined>;
    public tradeListVisible: KnockoutComputed<boolean>;

    /**
     * Creates a new ProductPresenter instance
     * @param product - The product to present
     * @param island - The island this product belongs to (unused, kept for compatibility)
     */
    constructor(product: Product, island: KnockoutObservable<Island>) {
        if (!product) {
            throw new Error('ProductPresenter product is required');
        }

        this.product = product;
        this.island = island;
        this.instance = ko.pureComputed(() => this.island().assetsMap.get(this.product.guid) as Product);
        this.guid = this.product.guid;

        // Create factory presenters for each factory producing this product
        this.factoryPresenters = product.factories.map(f => new FactoryPresenter(f, this));

        // Filter visible factories
        this.visibleFactories = ko.pureComputed(() =>
            this.factoryPresenters.filter(fp => fp.visible())
        );

        // Available suppliers for selection (excluding islands - they get separate UI)
        this.availableSuppliers = ko.pureComputed(() => {
            const suppliers: SupplierOption[] = [];

            // 1. Factory suppliers (regional factories)
            for (const factory of this.instance().availableFactories()) {
                if (factory.island === island()) {
                    suppliers.push({
                        type: 'factory',
                        supplier: factory,
                        label: factory.getRegionExtendedName(),
                        icon: factory.icon || factory.getIcon()
                    });
                }
            }

            // 2. Extra good suppliers
            const extraGoodSuppliers = this.instance().extraGoodSuppliers;
            if (extraGoodSuppliers) {
                for (const supplier of extraGoodSuppliers) {
                    if (supplier.canSupply() && supplier.island === island()) {
                        suppliers.push({
                            type: 'extra_good',
                            supplier: supplier,
                            label: `${supplier.factory.name()} (Extra Goods)`,
                            icon: './icons/icon_add_goods_socket_white.png'
                        });
                    }
                }
            }

            // 3. Passive trade (always available)
            suppliers.push({
                type: 'passive_trade',
                supplier: this.instance().passiveTradeSupplier,
                label: 'Manual Trade Input',
                icon: './icons/icon_transporter_loading_light.png'
            });

            return suppliers;
        });

        // Delegate to product's defaultSupplier
        this.defaultSupplier = ko.pureComputed(() => this.instance().defaultSupplier());

        // Selected supplier option (for binding to dropdown)
        this.selectedSupplierOption = ko.observable(null);

        // Island selection for trade route creation
        this.selectedTradeIsland = ko.observable(null);
        this.tradeRouteExport = ko.observable(false);
        this.tradeRouteAmount = ko.observable(0);

        this.availableTradeIslands = ko.pureComputed(() => {
            if (!this.instance().tradeList) return [];

            // Filter islands that:
            // 1. Have this product's factory available
            // 2. Are not the current island
            // 3. Don't already have a trade route
            const usedIslands = new Set<Island>();
            for (const route of this.instance().tradeList.routes()) {
                usedIslands.add(route.from);
                usedIslands.add(route.to);
            }

            return view.islands().filter((i: Island) => {
                if (i === island() || i.isAllIslands()) return false;
                if (usedIslands.has(i)) return false;

                const islandProduct = i.assetsMap.get(this.instance().guid);
                return islandProduct && islandProduct.factories && islandProduct.factories.length > 0;
            });
        });

        // Calculate total production (from all local suppliers + trade imports)
        this.totalProduction = ko.pureComputed(() => {
            let total = 0;

            // Production from local suppliers (factories, extra goods)
            const suppliers = this.instance().availableSuppliersNoRoutes();
            if (suppliers) {
                for (const supplier of suppliers) {
                    if ((supplier as any).island === island) {
                        total += supplier.defaultProduction();
                    }
                }
            }

            // Add trade route imports
            if (this.instance().tradeList) {
                total += this.instance().tradeList.outputAmount();
            }

            return total;
        });

        // Aggregate demand
        this.totalDemand = ko.pureComputed(() => this.instance().totalDemand());

        // Net balance (production - demand)
        this.netBalance = ko.pureComputed(() =>
            this.totalProduction() - this.totalDemand()
        );

        // Trade route management
        this.tradeList = ko.pureComputed(() => this.instance().tradeList);

        // Determine region from factories
        this.region = ko.pureComputed(() => {
            const factories = this.visibleFactories();
            if (factories.length > 0) {
                return factories[0].region();
            }
            return undefined;
        });

        // UI properties
        this.visible = ko.computed(() => {
            if (!this.instance().available())
                return false;

            const product = this.instance();
            const extraGoodAmount = product && product.extraGoodProductionList ? product.extraGoodProductionList.amount() : 0;
            const tradeList = this.tradeList();

            if (extraGoodAmount > EPSILON || tradeList.inputAmount() > EPSILON || tradeList.outputAmount() > EPSILON || this.totalDemand() > EPSILON)
                return true;

            for (var factory of this.visibleFactories())
                if (Math.abs(factory.instance().throughput()) > EPSILON ||
                    factory.instance().buildings.constructed() > 0)
                    return true;

            const productRegion = this.region();
            if (this.island().region.id != "Meta" && productRegion && productRegion != this.island().region)
                return false;

            if (window.view.settings.showAllConstructableFactories && window.view.settings.showAllConstructableFactories.checked())
                return true;

            // Show if any visible factories exist
            return this.visibleFactories().length > 0;
        });

        this.regionIconVisible = ko.pureComputed(() => this.island().region.id == "Meta");

        this.name = ko.pureComputed(() => this.product.name());
        this.icon = ko.pureComputed(() => this.product.icon as string);

        this.isHighlightedAsMissing = ko.pureComputed(() => {
            if (!window.view.settings.missingBuildingsHighlight || !window.view.settings.missingBuildingsHighlight.checked())
                return false;

            const defaultSupplier =  this.defaultSupplier()
            if (!(defaultSupplier instanceof Factory))
                return false;

            return defaultSupplier.buildings.required() > defaultSupplier.buildings.constructed() + ACCURACY;
        });

        this.tradeListVisible = ko.pureComputed(() => this.tradeList()?.visible());
    }

    /**
     * Handles supplier selection from dropdown
     * @param option - The selected supplier option
     */
    selectSupplier(option: SupplierOption): void {
        if (!option) return;

        this.instance().updateDefaultSupplier(option.supplier);
    }

    /**
     * Creates a trade route from selected island
     */
    createTradeRoute(): void {
        const island = this.selectedTradeIsland();
        if (!island) return;

        const amount = this.tradeRouteAmount() || 0;
        const isExport = this.tradeRouteExport();

        const route = new TradeRoute(
            this.product.guid,
            isExport ? this.island() : island,
            isExport ? island : this.island(),
            amount
        );

        this.instance().tradeList.routes.push(route);
        view.tradeManager.add(route);

        // Set as default supplier if importing
        if (!isExport) {
            this.instance().updateDefaultSupplier(route);
        }

        // Reset form
        this.selectedTradeIsland(null);
        this.tradeRouteAmount(0);
    }

    /**
     * Checks if trade route can be created
     */
    canCreateTradeRoute(): boolean {
        return this.selectedTradeIsland() != null;
    }

    /**
     * Opens product config dialog
     */
    openConfigDialog(): void {
        view.selectedProduct(this);
        $('#product-config-dialog').modal('show');
    }

    /**
     * Gets label for current default supplier
     */
    getDefaultSupplierLabel(): string {
        const supplier = this.defaultSupplier();
        if (!supplier) return 'None';

        if (supplier.type === 'factory') {
            return (supplier as Factory).getRegionExtendedName();
        } else if (supplier.type === 'trade_route') {
            const route = supplier as TradeRoute;
            return `Trade: ${route.from.name()}`;
        } else if (supplier.type === 'extra_good') {
            return 'Extra Goods';
        } else if (supplier.type === 'passive_trade') {
            return 'Manual Trade';
        }

        return 'Unknown';
    }

    /**
     * Gets icon for current default supplier
     */
    getDefaultSupplierIcon(): string {
        const supplier = this.defaultSupplier();
        if (!supplier) return '';

        if (supplier.type === 'factory') {
            return (supplier as Factory).icon || '';
        } else if (supplier.type === 'trade_route') {
            return './icons/icon_shiptrade.png';
        } else if (supplier.type === 'extra_good') {
            return './icons/icon_add_goods_socket_white.png';
        } else if (supplier.type === 'passive_trade') {
            return './icons/icon_transporter_loading_light.png';
        }

        return '';
    }
}

/**
 * Presenter for ProductCategory - provides category-level UI bindings
 * Wraps ProductCategory and filters productPresenters by category's products
 */
export class CategoryPresenter {
    // === CORE PROPERTIES ===
    public instance: KnockoutObservable<ProductCategory>;
    public category: ProductCategory;
    public island: KnockoutObservable<Island>;

    // === DELEGATED PROPERTIES ===
    public guid: KnockoutComputed<number>;
    public name: KnockoutComputed<string>;

    // === PRODUCT PRESENTERS ===
    public productPresenters: ProductPresenter[];

    /**
     * Creates a new CategoryPresenter instance
     * @param category - The product category to present
     * @param island - The island this category belongs to
     */
    constructor(category: ProductCategory, island: KnockoutObservable<Island>) {
        if (!category) {
            throw new Error('CategoryPresenter category is required');
        }
        if (!island) {
            throw new Error('CategoryPresenter island is required');
        }

        this.category = category;
        this.island = island;
        this.instance = ko.computed(() => this.island().assetsMap.get(category.guid));

        // Delegate to category properties
        this.guid = ko.pureComputed(() => this.category.guid);
        this.name = ko.pureComputed(() => this.category.name());

        // Filter product presenters for products in this category
        this.productPresenters = [];
        
        for (const product of category.products)
            this.productPresenters.push(new ProductPresenter(product, island));

    }
}
