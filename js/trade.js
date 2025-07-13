// @ts-check
import { ACCURACY, ALL_ISLANDS, createIntInput, createFloatInput, NamedElement, EPSILON } from './util.js'
import { Product } from './production.js'
import { Factory } from './factories.js'

var ko = require( "knockout" );

/**
 * Represents a trade route between two islands
 * Manages the transportation of goods between factories on different islands
 */
class TradeRoute {
    /**
     * Creates a new TradeRoute instance
     * @param {Object} config - Configuration object for the trade route
     */
    constructor(config) {
        // Validate required parameters
        if (!config) {
            throw new Error('TradeRoute config is required');
        }
        if (!config.from) {
            throw new Error('TradeRoute config.from is required');
        }
        if (!config.to) {
            throw new Error('TradeRoute config.to is required');
        }
        if (!config.fromFactory) {
            throw new Error('TradeRoute config.fromFactory is required');
        }
        if (!config.toFactory) {
            throw new Error('TradeRoute config.toFactory is required');
        }

        // Explicit assignments
        this.from = config.from;
        this.to = config.to;
        this.fromFactory = config.fromFactory;
        this.toFactory = config.toFactory;
        this.amount = config.amount || 0;

        this.amount = createFloatInput(0, 0);
        this.amount(config.amount);
    }

    /**
     * Gets the opposite island in this trade route
     * @param {TradeList} list - The trade list to check against
     * @returns {Island} The opposite island
     */
    getOpposite(list) {
        if (list.island == this.from)
            return this.to;
        else
            return this.from;
    }

    /**
     * Gets the opposite factory in this trade route
     * @param {Factory} factory - The factory to check against
     * @returns {Factory} The opposite factory
     */
    getOppositeFactory(factory) {
        if (this.fromFactory == factory)
            return this.toFactory;
        else
            return this.fromFactory;
    }

    /**
     * Checks if this route is an export from the given list's island
     * @param {TradeList} list - The trade list to check
     * @returns {boolean} True if this is an export route
     */
    isExport(list) {
        return list.island == this.from;
    }

    /**
     * Deletes this trade route
     */
    delete() {
        view.tradeManager.remove(this);
    }
}

/**
 * Represents an NPC trader that provides goods
 * Manages NPC trade routes and goods production
 */
export class NPCTrader extends NamedElement {
    /**
     * Creates a new NPCTrader instance
     * @param {Object} config - Configuration object for the NPC trader
     */
    constructor(config) {
        // Validate required parameters
        if (!config) {
            throw new Error('NPCTrader config is required');
        }

        super(config);
        this.goodsProduction = config.goodsProduction || [];
    }
}

/**
 * Represents an NPC trade route
 * Manages automatic trade routes provided by NPC traders
 */
class NPCTradeRoute {
    /**
     * Creates a new NPCTradeRoute instance
     * @param {Object} config - Configuration object for the NPC trade route
     */
    constructor(config) {
        // Validate required parameters
        if (!config) {
            throw new Error('NPCTradeRoute config is required');
        }
        if (typeof config.ProductionPerMinute !== 'number') {
            throw new Error('NPCTradeRoute config.ProductionPerMinute is required and must be a number');
        }

        // Explicit assignments
        this.ProductionPerMinute = config.ProductionPerMinute;
        this.to = config.to;
        this.toFactory = config.toFactory;
        this.from = config.from;
        this.fromFactory = config.fromFactory;
        this.trader = config.trader;

        this.amount = this.ProductionPerMinute;
        this.checked = ko.observable(false);
        this.checked.subscribe(checked => {
            if (view.tradeManager) {
                if (checked)
                    view.tradeManager.npcRoutes.push(this);
                else
                    view.tradeManager.npcRoutes.remove(this);
            }
        });
    }
}

/**
 * Manages trade routes for a specific factory
 * Handles the creation and management of trade routes for a factory's output
 */
export class TradeList {
    /**
     * Creates a new TradeList instance
     * @param {Island} island - The island this trade list belongs to
     * @param {Factory} factory - The factory this trade list manages
     */
    constructor(island, factory) {
        // Validate required parameters
        if (!island) {
            throw new Error('TradeList island is required');
        }
        if (!factory) {
            throw new Error('TradeList factory is required');
        }

        // Explicit assignments
        this.island = island;
        this.factory = factory;

        this.routes = ko.observableArray();
        if (this.factory.outputs) {
            var traders = view.productsToTraders.get(this.factory.outputs[0].Product);
            if (traders)
                this.npcRoutes = traders.map(t => new NPCTradeRoute($.extend({}, t, { to: island, toFactory: factory })));
        }

        this.inputAmount = ko.pureComputed(() => {
            var amount = 0;
            for (var route of this.routes())
                if(route.isExport(this))
                    amount += route.amount();

            return amount;
        });

        this.outputAmount = ko.pureComputed(() => {
            var amount = 0;

            for (var route of (this.npcRoutes || []))
                amount += route.checked() ? route.amount : 0;

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
            if (this.npcRoutes != null && this.npcRoutes.length > 0)
                return true;

            return view.islands().length >= 2;
        });
    }

    /**
     * Checks if a new trade route can be created
     * @returns {boolean} True if a route can be created
     */
    canCreate() {
        return this.selectedIsland() && !this.selectedIsland().isAllIslands() && this.newAmount();
    }

    /**
     * Creates a new trade route
     */
    create() {
        if (!this.canCreate())
            return;

        var otherFactory;
        for (var f of this.selectedIsland().factories)
            if (f.guid == this.factory.guid) {
                otherFactory = f;
                break;
            }

        if (!otherFactory)
            return;

        if (this.export()) {
            var route = new TradeRoute({
                from: this.island,
                to: this.selectedIsland(),
                fromFactory: this.factory,
                toFactory: otherFactory,
                amount: this.newAmount()
            });
        } else {
            var route = new TradeRoute({
                to: this.island,
                from: this.selectedIsland(),
                toFactory: this.factory,
                fromFactory: otherFactory,
                amount: this.newAmount()
            });
        }

        this.routes.push(route);
        this.unusedIslands.remove(this.selectedIsland());
        otherFactory.tradeList.routes.push(route);

        view.tradeManager.add(route);
    }

    /**
     * Called when the trade list dialog is shown
     * Updates the available islands and default values
     */
    onShow() {
        var usedIslands = new Set(this.routes().flatMap(r => [r.from, r.to]));
        var islands = view.islands().filter(i => !usedIslands.has(i) && i != this.island);
        islands.sort((a, b) => {
            var sIdxA = view.sessions.indexOf(a.session);
            var sIdxB = view.sessions.indexOf(b.session);

            if (sIdxA == sIdxB) {
                return a.name().localeCompare(b.name());
            } else {
                return sIdxA - sIdxB;
            }
        });
        var overProduction = this.factory.overProduction();

        this.export(overProduction > EPSILON);
        this.newAmount(Math.max(overProduction, this.factory.substitutableOutputAmount()));

        this.unusedIslands(islands);
    }
}

/**
 * Manages all trade routes in the application
 * Handles persistence and global trade route management
 */
export class TradeManager {
    /**
     * Creates a new TradeManager instance
     */
    constructor() {
        this.key = "tradeRoutes";
        this.npcKey = "npcTradeRoutes";
        this.npcRoutes = ko.observableArray();
        this.routes = ko.observableArray();

        view.selectedFactory.subscribe(f => {
            if (!(f instanceof Factory))
                return;

            if (f.tradeList)
                f.tradeList.onShow();
        });

        if (localStorage) {
            // trade routes
            var islands = new Map();
            for (var i of view.islands())
                if (!i.isAllIslands())
                    islands.set(i.name(), i);

            var resolve = name => name == ALL_ISLANDS ? view.islandManager.allIslands : islands.get(name);

            var text = localStorage.getItem(this.key);
            var json = text ? JSON.parse(text) : [];
            for (var r of json) {
                var config = {
                    from: resolve(r.from),
                    to: resolve(r.to),
                    amount: parseFloat(r.amount)
                };

                if (!config.from || !config.to)
                    continue;

                config.fromFactory = config.from.assetsMap.get(r.factory);
                config.toFactory = config.to.assetsMap.get(r.factory);

                if (!config.fromFactory || !config.toFactory)
                    continue;

                var route = new TradeRoute(config);
                this.routes.push(route);
                config.fromFactory.tradeList.routes.push(route);
                config.toFactory.tradeList.routes.push(route);
            }

            this.persistenceSubscription = ko.computed(() => {
                var json = [];

                for (var r of this.routes()) {
                    json.push({
                        from: r.from.isAllIslands() ? ALL_ISLANDS : r.from.name(),
                        to: r.to.isAllIslands() ? ALL_ISLANDS : r.to.name(),
                        factory: r.fromFactory.guid,
                        amount: r.amount()
                    });
                }

                localStorage.setItem(this.key, JSON.stringify(json, null, 4));

                return json;
            });

            // npc trade routes
            text = localStorage.getItem(this.npcKey);
            json = text ? JSON.parse(text) : [];
            for (var r of json) {
                var to = resolve(r.to);

                if (!to)
                    continue;

                var factory = to.assetsMap.get(r.factory);
                if (!factory)
                    continue;

                factory.tradeList.npcRoutes.forEach(froute => {
                    if (froute.trader.guid === r.trader) {
                        froute.checked(true);
                        this.add(froute);
                    }
                });
            }

            this.npcPersistenceSubscription = ko.computed(() => {
                var json = [];

                for (var r of this.npcRoutes()) {
                    json.push({
                        trader: r.trader.guid,
                        to: r.to.isAllIslands() ? ALL_ISLANDS : r.to.name(),
                        factory: r.toFactory.guid
                    });
                }

                localStorage.setItem(this.npcKey, JSON.stringify(json, null, 4));

                return json;
            });
        }
    }

    /**
     * Adds a route to the trade manager
     * @param {TradeRoute|NPCTradeRoute} route - The route to add
     */
    add(route) {
        if (route instanceof NPCTradeRoute)
            this.npcRoutes.push(route);
        else
            this.routes.push(route);
    }

    /**
     * Removes a route from the trade manager
     * @param {TradeRoute|NPCTradeRoute} route - The route to remove
     */
    remove(route) {
        if (route instanceof NPCTradeRoute) {
            this.npcRoutes.remove(route);
            route.checked(false);
            return;
        }

        route.fromFactory.tradeList.routes.remove(route);
        route.toFactory.tradeList.routes.remove(route);
        this.routes.remove(route);

        route.toFactory.tradeList.unusedIslands.unshift(route.from);
        route.fromFactory.tradeList.unusedIslands.unshift(route.to);
    }

    /**
     * Handles island deletion by removing related routes
     * @param {Island} island - The island being deleted
     */
    islandDeleted(island) {
        {
            var deletedRoutes = this.routes().filter(r => r.to === island || r.from === island);
            deletedRoutes.forEach(r => this.remove(r));
        }

        {
            var deletedRoutes = this.npcRoutes().filter(r => r.to === island);
            deletedRoutes.forEach(r => this.remove(r));
        }
    }
}


