import { ACCURACY, isPreview, formatNumber, formatPercentage, versionCalculator, NamedElement, Option, DLC } from './util.js'
import { languageCodes, texts as locaTexts, options, serverOptions } from './i18n.js'

import { PopulationLevel, ResidenceBuilding } from './population.js'
import { NewspaperNeedConsumption, NewspaperNeedConsumptionEntry } from './consumption.js'
import { Consumer } from './factories.js'
import { NPCTrader, ContractUpgradeManager, TradeManager, ContractCreatorFactory } from './trade.js'
import { Region, Session, IslandManager } from './world.js'
import { DarkMode, ViewMode, Template, ProductionChainView, ResidenceEffectView, CollapsibleStates } from './views.js'

import './components.js'
import './params.js'

var ko = require("knockout");
require("knockout-amd-helpers");

// @ts-check

var moduleContext = require.context(".", true);
var templateContext = require.context("../templates", true);

/**
 * Custom module loader for Knockout AMD helpers
 * @param {string} moduleName - Name of the module to load
 * @param {Function} done - Callback function to execute when module is loaded
 */
ko.bindingHandlers.module.loader = function (moduleName, done) {
    var mod = moduleContext("./" + moduleName);
    done(mod);
}

ko.amdTemplateEngine.defaultSuffix = ".html";
/**
 * Custom template loader for Knockout AMD template engine
 * @param {string} templateName - Name of the template to load
 * @param {Function} done - Callback function to execute when template is loaded
 */
ko.amdTemplateEngine.loader = function (templateName, done) {
    var template = templateContext("./" + templateName + ko.amdTemplateEngine.defaultSuffix);
    done(template.default);
}

// Make utility functions globally available
window.ACCURACY = ACCURACY;
window.formatNumber = formatNumber;
window.formatPercentage = formatPercentage;
window.factoryReset = factoryReset;
window.exportConfig = exportConfig;

/**
 * Global view object containing all application state
 */
window.view = {
    settings: {
        language: ko.observable("english"),
        options: [],
        serverOptions: [],
        serverAddress: ko.observable(localStorage.getItem('serverAddress')||'localhost'),
    },
    texts: {},
    dlcs: [],
    dlcsMap: new Map()
};

// Set default language based on browser locale
for (var code in languageCodes)
    if (navigator.language.startsWith(code))
        view.settings.language(languageCodes[code]);

/**
 * Checks if loaded config is old and applies upgrade
 * Called after initialization to handle version migrations
 * @param {string} configVersion - The version of the loaded configuration
 */
function configUpgrade(configVersion) {
    if (configVersion == null)
        configVersion = "v1.0";

    try {
        configVersion = configVersion.replace(/[^.\d]/g, "").split(".").map(d => parseInt(d));
        
        /**
         * Checks if a setting is enabled
         * @param {string} settingName - Name of the setting to check
         * @returns {boolean} True if the setting is enabled
         */
        function isChecked(settingName) {
            var val = localStorage.getItem(`settings.${settingName}`);
            return val != null && parseInt(val);
        }
        
        /**
         * Removes a setting from localStorage
         * @param {string} settingName - Name of the setting to remove
         */
        function remove(settingName) {
            localStorage.removeItem(`settings.${settingName}`);
        }

        // Handle DLC7 (contracts) migration
        {
            let id = "contracts";
            if (isChecked(id)) {
                var dlc = view.dlcsMap.get("dlc7");
                if (dlc)
                    dlc.checked(true);
            }
            remove(id);
        }

        // Handle version 10 migration
        if (configVersion[0] < 10) {
            if (isChecked("noOptionalNeeds"))
                for (var isl of view.islands())
                    for (var l of isl.populationLevels)
                        for (var n of l.luxuryNeeds)
                            n.checked(false);

            for (var key of ["simpleView", "hideNewWorldConstructionMaterial", "populationInput", "consumptionModifier", "additionalProduction", "tradeRoutes", "autoApplyExtraNeed", "autoApplyConsumptionUpgrades", "deriveResidentsPerHouse", "noOptionalNeeds"])
                remove(key);

            for (var key of ["populationLevelAmount"])
                localStorage.removeItem(`serverSettings.${key}`);

            for (var isl of view.islands()) {
                for (var b of isl.residenceBuildings) {
                    for (var key of ["limitPerHouse", "limit", "fixLimitPerHouse"])
                        isl.storage.removeItem(`${b.guid}.${key}`);
                }

                for (var l of isl.populationLevels) {
                    for (var key of ["limitPerHouse", "limit", "fixLimitPerHouse", "amountPerHouse", "amount", "fixAmountPerHouse"])
                        isl.storage.removeItem(`${l.guid}.${key}`);

                    for (let n of l.needs)
                        isl.storage.removeItem(`${l.guid}[${n.guid}].percentBoost`);
                }
            }
        }

        // Handle version 11 migration
        if (configVersion[0] < 11) {
            for (var isl of view.islands()) {
                for (var f of isl.factories) {
                    var id = `${f.guid}.palaceBuff.checked`;
                    var buffChecked = isl.storage.getItem(id);
                    if (buffChecked == "1" && f.palaceBuff == null && f.setBuff != null) {
                        f.setBuffChecked(true);
                        isl.storage.removeItem(id);
                    }
                }
            }
        }
    } catch (e) { console.warn(e); }
}

/**
 * Resets the factory configuration by clearing localStorage and reloading
 */
function factoryReset() {
    if (localStorage)
        localStorage.clear();

    location.reload();
}

/**
 * Checks if the application is running locally
 * @returns {boolean} True if running locally
 */
function isLocal() {
    return window.location.protocol == 'file:' || /localhost|127\.0\.0\.1/.test(window.location.hostname);
}

/**
 * Exports the current configuration to a JSON file
 */
function exportConfig() {
    var saveData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, fileName) {
            var blob = new Blob([JSON.stringify(data, null, 4)], { type: "text/json" }),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());

    saveData(localStorage, ("Anno1800CalculatorConfig") + ".json");
}

/**
 * Checks for updates and shows notifications
 * Compares current version with latest GitHub release
 */
function checkAndShowNotifications() {
    $.getJSON("https://api.github.com/repos/NiHoel/Anno1800Calculator/releases/latest").done((release) => {
        $('#download-calculator-button').attr("href", release.zipball_url);

        if (isLocal()) {
            if (release.tag_name !== versionCalculator) {
                $.notify({
                    // options
                    message: view.texts.calculatorUpdate.name()
                }, {
                    // settings
                    type: 'warning',
                    placement: { align: 'center' }
                });
            }
        }

        if (localStorage) {
            if (localStorage.getItem("versionCalculator") != versionCalculator) {
                if (view.texts.newFeature.name() && view.texts.newFeature.name().length)
                    $.notify({
                        // options
                        message: view.texts.newFeature.name()
                    }, {
                        // settings
                        type: 'success',
                        placement: { align: 'center' },
                        timer: 60000
                    });
            }

            localStorage.setItem("versionCalculator", versionCalculator);
        }
    });
}

/**
 * Installs event listener for importing configuration files
 * Handles file selection and JSON parsing
 */
function installImportConfigListener() {
    if (localStorage) {
        $('#config-selector').on('change', event => {
            event.preventDefault();
            if (!event.target.files || !event.target.files[0])
                return;

            let file = event.target.files[0];
            console.log(file);
            var fileReader = new FileReader();

            fileReader.onload = function (ev) {
                let text = ev.target.result || ev.currentTarget.result;

                try {
                    let config = JSON.parse(text);

                    if (localStorage) {
                        localStorage.clear();
                        for (var a in config)
                            localStorage.setItem(a, config[a]);

                        if (!config.islandNames) { // old save, restore islands
                            for (var island of view.islands()) {
                                if (!island.isAllIslands())
                                    island.storage.save();
                            }
                            let islandNames = JSON.stringify(view.islands().filter(i => !i.isAllIslands()).map(i => i.name()));
                            localStorage.setItem("islandNames", islandNames);
                        }
                        
                        location.reload();
                    } else {
                        console.error("No local storage accessible to write result into.");
                    }
                } catch (e) {
                    console.error(e);
                }
            };
            fileReader.onerror = function (err) {
                console.error(err);
            };

            fileReader.readAsText(file);
        });
    }
}

/**
 * Manages population reading from the Anno server
 * Handles communication with the game server for real-time data
 */
class PopulationReader {
    /**
     * Creates a new PopulationReader instance
     */
    constructor() {
        // Explicit assignments
        this.url = 'http://localhost:8000/AnnoServer/Population';
        this.notificationShown = false;
        this.currentVersion = null;
        this.recentVersion = null;
        this.requestInterval = null;

        // only ping the server when the website is run locally
        if (isLocal()) {
            console.log('waiting for responses from ' + window.view.settings.serverAddress());
            this.requestInterval = setInterval(this.handleResponse.bind(this), 1000);

            $.getJSON("https://api.github.com/repos/NiHoel/Anno1800UXEnhancer/releases/latest").done((release) => {
                this.recentVersion = release.tag_name;
                this.checkVersion();
            });
        }
    }

    /**
     * Handles responses from the Anno server
     * Processes population data and updates the application state
     */
    async handleResponse() {
        let host = window.view.settings.serverAddress();
        localStorage.setItem('serverAddress', host);
        let url_with_params = 'http://' + host + ":8000/AnnoServer/Population?" +
            jQuery.param({
                lang: view.settings.language(),
                //                optimalProductivity: view.settings.optimalProductivity.checked()
            });

        try {
            const response = await fetch(url_with_params);
            const json = await response.json(); //extract JSON from the http response

            if (!json)
                return;

            if (json.version) {
                this.currentVersion = json.version;
                this.checkVersion();
            }

            if (view.settings.proposeIslandNames.checked()) {
                for (var isl of (json.islands || [])) {
                    view.islandManager.registerName(isl.name, view.assetsMap.get(isl.session));
                }
            }

            var island = null;
            if (json.islandName) {
                island = view.islandManager.getByName(json.islandName);
            }

            if (!island)
                return;

            if (view.settings.updateSelectedIslandOnly.checked() && island != view.island())
                return;

            for (let key in json) {
                let asset = island.assetsMap.get(parseInt(key));
                if (asset instanceof PopulationLevel) {
                    if (!asset.canEdit()) {
                        continue; // do not update summary values if skyscrapers are used
                    }

                    if (json[key].existingBuildings && view.settings.populationLevelExistingBuildings.checked()) {
                        asset.existingBuildings(json[key].existingBuildings);
                    }
                } else if (asset instanceof Consumer) {
                    if (json[key].existingBuildings && view.settings.factoryExistingBuildings.checked())
                        asset.existingBuildings(parseInt(json[key].existingBuildings));

                    if (view.settings.factoryPercentBoost.checked()) {
                        if (view.settings.optimalProductivity.checked()) {
                            if (asset.existingBuildings() && json[key].limit) {
                                var limit = Math.max(0, json[key].limit - asset.extraGoodProductionList.amount());

                                if (asset.getOutputs().length && asset.getOutputs()[0].product.producers.length > 1) {
                                    // in all islands view, multiple factories can be produce one good
                                    // the server stored the same values for all of these factories
                                    // we consider them together and sum their existing buildings

                                    var factories = [];
                                    var countBuildings = 0;

                                    for (var guid of asset.getOutputs()[0].product.producers) {
                                        var factory = island.assetsMap.get(guid);

                                        if (factory.existingBuildings() && json[guid]) {
                                            factories.push(factory);
                                            countBuildings += factory.existingBuildings() * factory.extraGoodFactor() * factory.tpmin;
                                        }
                                    }

                                    var percentBoost = 100 * limit / countBuildings;
                                    if (countBuildings == 0 || percentBoost < 50 || percentBoost >= 1000)
                                        continue;

                                    for (var factory of factories)
                                        factory.percentBoost(percentBoost);
                                }
                                else {
                                    var percentBoost = 100 * limit / asset.existingBuildings() / asset.tpmin / asset.extraGoodFactor();
                                    if (percentBoost >= 50 && percentBoost < 1000)
                                        asset.percentBoost(percentBoost);
                                }
                            }
                        }
                        else if (json[key].percentBoost)
                            asset.percentBoost(parseInt(json[key].percentBoost));
                    }
                } else if (asset instanceof ResidenceBuilding) {
                    if (json[key].existingBuildings)
                        asset.existingBuildings(parseInt(json[key].existingBuildings));
                }
            }
        } catch (e) {
        }
    }

    /**
     * Checks if the server version is up to date
     * Shows notification if update is available
     */
    checkVersion() {
        if (!this.notificationShown && this.recentVersion && this.currentVersion && this.recentVersion !== this.currentVersion) {
            this.notificationShown = true;
            $.notify({
                // options
                message: view.texts.serverUpdate.name()
            }, {
                // settings
                type: 'warning',
                placement: { align: 'center' }
            });
        }
    }
}

/**
 * Initializes the application
 * Sets up all components, DLCs, settings, and global state
 * @param {boolean} isFirstRun - Whether this is the first time running the application
 * @param {string} configVersion - The version of the loaded configuration
 */
function init(isFirstRun, configVersion) {
    view.darkMode = new DarkMode();

    // Set up DLCs
    view.dlcs = [];
    view.dlcsMap = new Map();
    for (let dlc of (params.dlcs || [])) {
        var d = new DLC(dlc);
        view.dlcs.push(d);
        view.dlcsMap.set(d.id, d);
        if (localStorage) {
            let id = "settings." + d.id;
            if (localStorage.getItem(id) != null)
                d.checked(parseInt(localStorage.getItem(id)));

            d.checked.subscribe(val => localStorage.setItem(id, val ? 1 : 0));
        }
    }

    // Set up options
    view.settings.options = [];
    for (let attr in options) {
        let o = new Option(options[attr]);
        o.id = attr;
        view.settings[attr] = o;
        view.settings.options.push(o);

        if (localStorage) {
            let id = "settings." + attr;
            if (localStorage.getItem(id) != null)
                o.checked(parseInt(localStorage.getItem(id)));

            o.checked.subscribe(val => localStorage.setItem(id, val ? 1 : 0));
        }
    }

    view.settings.languages = params.languages;

    // Set up server options
    view.settings.serverOptions = [];
    for (let attr in serverOptions) {
        let o = new Option(serverOptions[attr]);
        o.id = attr;
        if (attr !== "optimalProductivity")
            o.checked(true);
        view.settings[attr] = o;
        view.settings.serverOptions.push(o);

        if (localStorage) {
            let id = "serverSettings." + attr;
            if (localStorage.getItem(id) != null)
                o.checked(parseInt(localStorage.getItem(id)));

            o.checked.subscribe(val => localStorage.setItem(id, val ? 1 : 0));
        }
    }

    view.assetsMap = new Map();

    // Set up regions
    view.regions = [];
    for (let region of (params.regions || [])) {
        let r = new Region(region);
        view.assetsMap.set(r.guid, r);
        view.regions.push(r);
    }

    // Set up sessions
    view.sessions = [];
    for (let session of (params.sessions || [])) {
        let s = new Session(session, view.assetsMap);
        view.assetsMap.set(s.guid, s);
        view.sessions.push(s);
    }

    // Set up newspaper consumption
    view.newspaperConsumption = new NewspaperNeedConsumption();
    if (localStorage) {
        let id = "newspaperPropagandaBuff";
        if (localStorage.getItem(id) != null)
            view.newspaperConsumption.selectedBuff(localStorage.getItem(id));

        view.newspaperConsumption.selectedBuff.subscribe(val => localStorage.setItem(id, val));
    }

    for (var e of (params.newspaper || [])) {
        var effect = new NewspaperNeedConsumptionEntry(e);
        view.newspaperConsumption.add(effect);

        if (localStorage) {
            let id = effect.guid + ".checked";
            if (localStorage.getItem(id) != null)
                effect.checked(parseInt(localStorage.getItem(id)));

            effect.checked.subscribe(val => localStorage.setItem(id, val ? 1 : 0));
        }
    }

    // Set up NPC traders
    view.productsToTraders = new Map();
    for (var t of (params.traders || [])) {
        var trader = new NPCTrader(t);

        for (var r of t.goodsProduction) {
            var route = $.extend({}, r, { trader: trader });
            if (view.productsToTraders.has(r.Good))
                view.productsToTraders.get(r.Good).push(route);
            else
                view.productsToTraders.set(r.Good, [route]);
        }
    }

    if (params.tradeContracts) {
        view.contractUpgradeManager = new ContractUpgradeManager();
    }

    // Set up island management
    view.islandManager = new IslandManager(params, isFirstRun);

    if (localStorage) {
        let id = "language";
        if (localStorage.getItem(id))
            view.settings.language(localStorage.getItem(id));

        view.settings.language.subscribe(val => localStorage.setItem(id, val));
    }

    if (!isFirstRun)
        configUpgrade(configVersion);
    else
        localStorage.setItem("upgrade.bonusResidentsApplied", 1);

    // Set up modal dialogs
    view.collapsibleStates = new CollapsibleStates();
    view.selectedFactory = ko.observable(view.island().factories[0]);
    view.selectedPopulationLevel = ko.observable(view.island().populationLevels[0]);
    view.productionChain = new ProductionChainView(view.selectedFactory);
    view.selectedMultiFactoryProducts = ko.observable(view.island().multiFactoryProducts);
    view.selectedExtraGoodItems = ko.observable(view.island().extraGoodItems);
    view.selectedContractManager = ko.observable(view.island().contractManager);
    view.selectedResidenceEffectView = ko.observable(new ResidenceEffectView([view.island().residenceBuildings[0]]));

    view.tradeManager = new TradeManager();

    if (params.tradeContracts) {
        view.contractCreatorFactory = new ContractCreatorFactory();
    }

    // Set up templates
    var allIslands = view.islandManager.allIslands;
    var selectedIsland = view.island();
    var templates = [];
    var arrayToTemplate = (name) => allIslands[name].map((asset, index) => {
        var t = new Template(asset, selectedIsland, name, index);
        templates.push(t);
        return t;
    });

    view.island.subscribe(i => templates.forEach(t => t.parentInstance(i)));

    view.template = {
        populationLevels: arrayToTemplate("populationLevels"),
        categories: arrayToTemplate("categories"),
        consumers: arrayToTemplate("consumers"),
        powerPlants: arrayToTemplate("powerPlants"),
        publicServices: arrayToTemplate("publicServices"),
        publicRecipeBuildings: arrayToTemplate("publicRecipeBuildings")
    }

    if(isFirstRun)
        view.viewMode = new ViewMode(isFirstRun);

    ko.applyBindings(view, $(document.body)[0]);

    // Set up modal event handlers
    $('#factory-choose-dialog').on('show.bs.modal',
        () => {
            view.selectedMultiFactoryProducts(view.island().multiFactoryProducts
                .filter(p => p.availableFactories().length > 1)
                .sort((a, b) => a.name().localeCompare(b.name())));
        });

    $('#item-equipment-dialog').on('show.bs.modal',
        () => {
            view.selectedExtraGoodItems(view.island().extraGoodItems);
        });

    $('#contract-management-dialog').on('show.bs.modal',
        () => {
            view.selectedContractManager(view.island().contractManager);
        });

    $('*').on('hidden.bs.modal', () => {
        for (var dialog of ['contract-management', 'download', 'factory-choose', 'factory-config', 'island-management', 'island-rename', 'item-equipment', 'population-level-config', 'residence-effect', 'settings', 'trade-routes-management', 'view-mode', 'help']) {
            var classes = $('#' + dialog + '-dialog').attr('class');
            if (classes != null && classes.indexOf("show") != -1) {
                $('body').addClass('modal-open');
                break;
            }
        }
    });

    if (view.viewMode)
        $('#view-mode-dialog').modal("show");

    view.island().name.subscribe(val => { window.document.title = val; });

    // Set up key bindings
    var keyBindings = ko.computed(() => {
        var bindings = new Map();

        var language = view.settings.language();
        if (language == 'chinese' || language == 'korean' || language == 'japanese' || language == 'taiwanese') {
            language = 'english';
        }

        for (var l of view.island().populationLevels) {
            var name = l.locaText[language];

            for (var c of name.toLowerCase()) {
                if (!bindings.has(c)) {
                    bindings.set(c, $(`.ui-tier-unit-name[tier-unit-guid=${l.guid}] ~ .input .input-group input`));
                    l.hotkey(c);
                    break;
                }
            }
        }

        return bindings;
    });

    $(document).on("keydown", (evt) => {
        if (evt.altKey || evt.ctrlKey || evt.shiftKey)
            return true;

        if (evt.target.tagName === 'TEXTAREA')
            return true;

        if (evt.target.tagName === 'INPUT' && evt.target.type === "text")
            return true;

        var focused = false;
        var bindings = keyBindings();
        if (bindings.has(evt.key)) {
            focused = true;
            bindings.get(evt.key).focus().select();
        }

        if (evt.target.tagName === 'INPUT' && !isNaN(parseInt(evt.key)) || focused) {
            let isDigit = evt.key >= "0" && evt.key <= "9";
            return ['ArrowUp', 'ArrowDown', 'Backspace', 'Delete'].includes(evt.key) || isDigit || evt.key === "." || evt.key === ",";
        }
    });

    if(!isPreview)
        // listen for the server providing the population count
        window.reader = new PopulationReader();
}

/**
 * Document ready handler
 * Initializes the application when the DOM is ready
 */
$(document).ready(function () {
    var configVersion = localStorage && localStorage.getItem("versionCalculator");
    var isFirstRun = !localStorage || localStorage.getItem("versionCalculator") == null;

    // Parse the parameters
    for (let attr in locaTexts) {
        view.texts[attr] = new NamedElement({ name: attr, locaText: locaTexts[attr] });
    }

    if (!isPreview)
        // check version of calculator - display update and new feature notification
        checkAndShowNotifications();
    else {
        $.notify({
            // options
            message: view.texts.newFeature.name()
        }, {
            // settings
            type: 'danger',
            placement: { align: 'center' },
            timer: 60000
        });
        if (localStorage)
            localStorage.setItem("versionCalculator", versionCalculator);
    }

    // Update links of download buttons
    $.getJSON("https://api.github.com/repos/NiHoel/Anno1800UXEnhancer/releases/latest").done((release) => {
        $('#download-calculator-server-button').attr("href", release.assets[0].browser_download_url);
    });

    init(isFirstRun, configVersion);

    $('[data-toggle="popover"]').popover();
    installImportConfigListener(); // must occur after template binding
})
