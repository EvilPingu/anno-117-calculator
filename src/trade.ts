import { ALL_ISLANDS, createFloatInput, EPSILON, ko } from './util';
import { Factory as FactoryClass } from './factories';
import { Island } from './world';
import { Supplier } from './suppliers';
import { Product } from './production';



declare const $: any;
declare const view: any;

interface ITradeList {
    island: Island;
    product: Product;
    routes: KnockoutObservableArray<TradeRoute>;
    inputAmount: KnockoutComputed<number>;
    outputAmount: KnockoutComputed<number>;
    amount: KnockoutComputed<number>;
    unusedIslands: KnockoutObservableArray<Island>;
    selectedIsland: KnockoutObservable<Island>;
    export: KnockoutObservable<boolean>;
    newAmount: KnockoutObservable<number>;
    visible: KnockoutComputed<boolean>;
    onShow(): void;
}

/**
 * Represents a trade route between two islands
 * Manages the transportation of goods between factories on different islands
 * Implements Supplier interface for the receiving island
 */
export class TradeRoute implements Supplier {
    // === SUPPLIER INTERFACE ===
    public readonly type: 'trade_route' = 'trade_route';
    public readonly product: Product;

    // === TRADE ROUTE PROPERTIES ===
    public readonly from: Island;
    public readonly to: Island;
    public readonly fromIslandProduct: Product; 
    public readonly toIslandProduct: Product; 
    public amount: KnockoutObservable<number>;
    public minAmount: KnockoutObservable<number>; // User-set minimum amount

    public readonly active: KnockoutObservable<boolean>; // when trade route is destructed, active makes canSupply return false and thus trigger unregistering as default supplier

    /**
     * Creates a new TradeRoute instance
     * @param config - Configuration object for the trade route
     */
    constructor(productGUID: number, from: Island, to: Island, minAmount: number = 0) {
        // Validate required parameters
        if (!from) {
            throw new Error('TradeRoute from is required');
        }
        if (!to) {
            throw new Error('TradeRoute to is required');
        }

        // Explicit assignments
        this.from = from;
        this.to = to;


        var toIslandProduct = this.to.assetsMap.get(productGUID) as Product
        var fromIslandProduct = this.from.assetsMap.get(productGUID) as Product

        if (!toIslandProduct || fromIslandProduct)
            throw new Error('TradeRoute product is required');

        this.fromIslandProduct = fromIslandProduct;
        this.toIslandProduct = toIslandProduct;

        // Supplier interface properties
        this.product = toIslandProduct;

        this.minAmount = createFloatInput(minAmount, 0);
        this.amount = ko.observable(minAmount);

        this.active = ko.observable(true);
    }

    /**
     * Gets the opposite island in this trade route
     * @param list - The trade list to check against
     * @returns The opposite island
     */
    getOpposite(list: ITradeList): Island {
        if (list.island == this.from)
            return this.to;
        else
            return this.from;
    }

    /**
     * Gets the product for the opposite island in this trade route
     * @param product - The product to check against
     * @returns The opposite product
     */
        getOppositeFactory(product: Product): Product {
            if (this.fromIslandProduct == product)
                return this.toIslandProduct;
            else
                return this.fromIslandProduct;
        }

    /**
     * Checks if this route is an export from the given list's island
     * @param list - The trade list to check
     * @returns True if this is an export route
     */
    isExport(list: ITradeList): boolean {
        return list.island == this.from;
    }

    /**
     * Deletes this trade route
     */
    delete(): void {
        if(!this.active())
            return;

        this.active(false);
        view.tradeManager.remove(this);        
    }

    // === SUPPLIER INTERFACE IMPLEMENTATION ===

    /**
     * Returns the amount imported to the receiving island (Supplier interface)
     */
    defaultProduction(): number {
        return this.minAmount();
    }

    /**
     * Trade routes can always supply (as long as they exist) (Supplier interface)
     */
    canSupply(): boolean {
        return this.active();
    }

    /**
     * Sets the trade route amount, respecting minAmount floor (Supplier interface)
     * @param amount - Requested import amount
     */
    setDemand(amount: number): void {
        const newAmount = Math.max(amount, this.minAmount());
        this.amount(newAmount);
    }

    /**
     * Reset to minAmount or delete trade route
     */
    unsetAsDefaultSupplier(): void {
        if (this.minAmount() > 0)
            this.amount(this.minAmount());
        else
            this.delete();
    }
}


/**
 * Handles the creation and management of trade routes for a product
 */
export class TradeList {
    public island: Island;
    public product: Product;
    public routes: KnockoutObservableArray<TradeRoute>;
    public inputAmount: KnockoutComputed<number>;
    public outputAmount: KnockoutComputed<number>;
    public amount: KnockoutComputed<number>;
    public unusedIslands: KnockoutObservableArray<Island>;
    public selectedIsland: KnockoutObservable<Island>;
    public export: KnockoutObservable<boolean>;
    public newAmount: KnockoutObservable<number>;
    public visible: KnockoutComputed<boolean>;

    /**
     * Creates a new TradeList instance
     * @param island - The island this trade list belongs to
     * @param product - The product this trade list manages
     */
    constructor(island: Island, product: Product) {
        // Validate required parameters
        if (!island) {
            throw new Error('TradeList island is required');
        }
        if (!product) {
            throw new Error('TradeList product is required');
        }

        // Explicit assignments
        this.island = island;
        this.product = product;

        this.routes = ko.observableArray();
        // Note: NPC routes removed - use PassiveTradeSupplier instead

        this.inputAmount = ko.pureComputed(() => {
            var amount = 0;
            for (var route of this.routes())
                if(route.isExport(this))
                    amount += route.amount();

            return amount;
        });

        this.outputAmount = ko.pureComputed(() => {
            var amount = 0;

            for (var route of this.routes())
                if (!route.isExport(this))
                    amount += route.amount();

            return amount;
        });

        this.amount = ko.pureComputed(() => this.outputAmount() - this.inputAmount() );

        // interface elements to create a new route
        this.unusedIslands = ko.observableArray();
        this.selectedIsland = ko.observable();
        this.export = ko.observable(false);
        this.newAmount = ko.observable(0);

        this.visible = ko.pureComputed(() => {
            return view.islands().length >= 2;
        });
    }

    /**
     * Checks if a new trade route can be created
     * @returns True if a route can be created
     */
    canCreate(): boolean {
        return this.selectedIsland() != null && !this.selectedIsland().isAllIslands() && this.newAmount() > EPSILON;
    }

    /**
     * Creates a new trade route
     */
    create(): void {
        if (!this.canCreate())
            return;

        if (this.export()) {
            var route = new TradeRoute(
                this.product.guid,
                this.island, //from
                this.selectedIsland(), //to
                this.newAmount()
            );
        } else {
            var route = new TradeRoute(
                this.product.guid,
                this.selectedIsland(), //from
                this.island, //to
                this.newAmount()
            );
        }

        this.routes.push(route);
        this.unusedIslands.remove(this.selectedIsland());

        view.tradeManager.add(route);
    }

    /**
     * Called when the trade list dialog is shown
     * Updates the available islands and default values
     */
    onShow(): void {
        var usedIslands = new Set(this.routes().flatMap((r: TradeRoute) => [r.from, r.to]));
        var islands = view.islands().filter((i: Island) => !usedIslands.has(i) && i != this.island);
        islands.sort((a: Island, b: Island) => {
            var sIdxA = view.sessions.indexOf(a.session);
            var sIdxB = view.sessions.indexOf(b.session);

            if (sIdxA == sIdxB) {
                return a.name().localeCompare(b.name());
            } else {
                return sIdxA - sIdxB;
            }
        });
        var overProduction = 0;
        var substitutableOutputAmount = 0;
        for (var factory of this.product.factories){
            overProduction += factory.overProduction();
            substitutableOutputAmount += factory.substitutableOutputAmount();
        }

        this.export(overProduction > EPSILON); 
        this.newAmount(Math.max(overProduction, substitutableOutputAmount));

        this.unusedIslands(islands);
    }
}

interface TradeRouteConfig {
    productGUID: number,
    from: string,
    to: string,
    minAmount: number,
    isDefaultSupplier: boolean
}

/**
 * Manages all trade routes in the application
 * Handles persistence and global trade route management
 */
export class TradeManager {
    public key: string;
    public routes: KnockoutObservableArray<TradeRoute>;
    public persistenceSubscription?: KnockoutComputed<void>;

    /**
     * Creates a new TradeManager instance
     */
    constructor() {
        this.key = "tradeRoutes";
        this.routes = ko.observableArray();

        view.selectedFactory.subscribe((f: any) => {
            if (!(f instanceof FactoryClass))
                return;

            const product = f.getProduct();
            if (product && product.tradeList && product.tradeList.onShow) {
                product.tradeList.onShow();
            }
        });

        if (localStorage) {
            // trade routes
            var islands = new Map<string, Island>();
            for (var i of view.islands())
                if (!i.isAllIslands())
                    islands.set(i.name(), i);

            var resolve = (name: string) => name == ALL_ISLANDS ? (view.islandManager.allIslands as Island) : islands.get(name);

            var text = localStorage.getItem(this.key);
            var json = text ? JSON.parse(text) : [];
            for (var r of json as TradeRouteConfig[]) {
                const productGUID = r.productGUID;
                const from = resolve(r.from);
                const to = resolve(r.to);
                const minAmount = r.minAmount;
                const isDefaultSupplier = r.isDefaultSupplier;

                if (!from || !to)
                    continue;


                var route = new TradeRoute(productGUID, from, to , minAmount);
                this.routes.push(route);
                route.fromIslandProduct.tradeList.routes.push(route);
                route.toIslandProduct.tradeList.routes.push(route);

                if (isDefaultSupplier)
                    route.toIslandProduct.updateDefaultSupplier(route);
            }

            this.persistenceSubscription = ko.computed(() => {
                var json : TradeRouteConfig[] = [];

                for (var r of this.routes()) {
                    json.push({
                        productGUID: r.product.guid,
                        from: r.from.isAllIslands() ? ALL_ISLANDS : r.from.name(),
                        to: r.to.isAllIslands() ? ALL_ISLANDS : r.to.name(),
                        minAmount: r.minAmount(),
                        isDefaultSupplier: r.product.defaultSupplier() == r
                    });
                }

                localStorage.setItem(this.key, JSON.stringify(json, null, 4));

                return json;
            });
            // Note: NPC trade routes persistence removed - use PassiveTradeSupplier instead
        }
    }

    /**
     * Adds a route to the trade manager
     * @param route - The route to add
     */
    add(route: TradeRoute): void {
        this.routes.push(route);
    }

    /**
     * Removes a route from the trade manager
     * @param route - The route to remove
     */
    remove(route: TradeRoute): void {
        route.fromIslandProduct.tradeList.routes.remove(route);
        route.toIslandProduct.tradeList.routes.remove(route);
        this.routes.remove(route);

        route.toIslandProduct.tradeList.unusedIslands.unshift(route.from);
        route.fromIslandProduct.tradeList.unusedIslands.unshift(route.to);
    }

    /**
     * Handles island deletion by removing related routes
     * @param island - The island being deleted
     */
    islandDeleted(island: Island): void {
        var deletedRoutes = this.routes().filter((r: TradeRoute) => r.to === island || r.from === island);
        deletedRoutes.forEach((r: TradeRoute) => this.remove(r));
    }
}