import { ACCURACY, formatNumber, formatPercentage, versionCalculator, Option, ko } from './util';
import { languageCodes, texts as locaTexts, options } from './i18n';
import { registerComponents } from './components';


import './params';
import { Island } from './types';
import { DarkMode } from './views';

declare const $: any;
declare const window: any;
declare const require: any;


// Make utility functions globally available
(window as any).ACCURACY = ACCURACY;
(window as any).formatNumber = formatNumber;
(window as any).formatPercentage = formatPercentage;
(window as any).factoryReset = factoryReset;
(window as any).exportConfig = exportConfig;

/**
 * Global view object containing all application state
 */
(window as any).view = {
    settings: {
        language: ko.observable("english"),
        options: []
    },
    texts: {},
    dlcs: [],
    dlcsMap: new Map(),
    // Add missing properties that are referenced in the original code
    selectedFactory: ko.observable(null),
    selectedPopulationLevel: ko.observable(null),
    selectedMultiFactoryProducts: ko.observable([]),
    selectedExtraGoodItems: ko.observable([]),
    selectedResidenceEffectView: ko.observable(null),
    island: ko.observable(null),
    islands: ko.observableArray([]),
    regions: [],
    sessions: [],
    assetsMap: new Map(),
    productsToTraders: new Map(),
    tradeManager: null,
    collapsibleStates: null,
    productionChain: null,
    template: {
        populationLevels: [],
        categories: [],
        consumers: [],
        publicServices: [],
        publicRecipeBuildings: []
    },
    viewMode: null,
    islandManager: null
};

// Set default language based on browser locale
for (const code in languageCodes) {
    if (navigator.language.startsWith(code)) {
        (window as any).view.settings.language(languageCodes[code]);
    }
}

/**
 * Checks if loaded config is old and applies upgrade
 * Called after initialization to handle version migrations
 * @param configVersion - The version of the loaded configuration
 */
function configUpgrade(configVersion: string | null): void {
    if (configVersion == null)
        configVersion = "v1.0";

    // Utility functions when upgrad logic is needed

    try {
        //const _versionParts = configVersion.replace(/[^.\d]/g, "").split(".").map(d => parseInt(d));
        
        /**
         * Checks if a setting is enabled
         * @param settingName - Name of the setting to check
         * @returns True if the setting is enabled
         */
/*         function _isChecked(settingName: string): boolean {
            const val = localStorage.getItem(`settings.${settingName}`);
            return val != null && parseInt(val) > 0;
        } */
        
        /**
         * Removes a setting from localStorage
         * @param settingName - Name of the setting to remove
         */
/*         function _remove(settingName: string): void {
            localStorage.removeItem(`settings.${settingName}`);
        } */

    } catch (e) { 
        console.warn(e); 
    }
}

/**
 * Resets the factory configuration by clearing localStorage and reloading
 */
function factoryReset(): void {
    if (localStorage)
        localStorage.clear();

    location.reload();
}

/**
 * Checks if the application is running locally
 * @returns True if running locally
 */
function isLocal(): boolean {
    return window.location.protocol == 'file:' || /localhost|127\.0\.0\.1/.test(window.location.hostname);
}

/**
 * Exports the current configuration to a JSON file
 */
function exportConfig(): void {
    const saveData = (function () {
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        return function (data: any, fileName: string): void {
            const blob = new Blob([JSON.stringify(data, null, 4)], { type: "text/json" });
            const url = window.URL.createObjectURL(blob);
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
function checkAndShowNotifications(): void {
    $.getJSON("https://api.github.com/repos/NiHoel/Anno1800Calculator/releases/latest").done((release: any) => {
        $('#download-calculator-button').attr("href", release.zipball_url);

        if (isLocal()) {
            if (release.tag_name !== versionCalculator) {
                ($ as any).notify({
                    // options
                    message: (window as any).view.texts.calculatorUpdate.name()
                }, {
                    // settings
                    type: 'warning',
                    placement: { align: 'center' }
                });
            }
        }

        if (localStorage) {
            if (localStorage.getItem("versionCalculator") != versionCalculator) {
                if ((window as any).view.texts.newFeature.name() && (window as any).view.texts.newFeature.name().length)
                    ($ as any).notify({
                        // options
                        message: (window as any).view.texts.newFeature.name()
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
function installImportConfigListener(): void {
    if (localStorage) {
        $('#config-selector').on('change', (event: JQuery.ChangeEvent) => {
            event.preventDefault();
            if (!event.target.files || !event.target.files[0])
                return;

            const file = event.target.files[0];
            console.log(file);
            const fileReader = new FileReader();

            fileReader.onload = function (ev: ProgressEvent<FileReader>) {
                const text = (ev.target as FileReader).result || (ev.currentTarget as FileReader).result;

                try {
                    let config = JSON.parse(text as string);

                    if (localStorage) {
                        localStorage.clear();
                        for (var a in config)
                            localStorage.setItem(a, config[a]);

                        if (!config.islandNames) { // old save, restore islands
                            for (var island of window.view.islands()) {
                                if (!island.isAllIslands())
                                    island.storage.save();
                            }
                            let islandNames = JSON.stringify(window.view.islands().filter((i: Island) => !i.isAllIslands()).map((i: Island) => i.name()));
                            localStorage.setItem("islandNames", islandNames);
                        }
                        
                        location.reload();
                    } else {
                        console.error("No local storage accessible to write result into.");
                    }
                } catch (e) {
                    console.error('Failed to parse config file:', e);
                }
            };

            fileReader.onerror = function (err: ProgressEvent<FileReader>) {
                console.error(err);
            };

            fileReader.readAsText(file);
        });
    }
}



/**
 * Sets up Knockout numeric input validation and extender
 */
function setupNumericExtender(): void {
    ko.extenders.numeric = function(target: any, options: any) {
        const result = ko.pureComputed({
            read: target,
            write: function(newValue: any) {
                const current = target();
                let newValueAsNum = isNaN(newValue) ? 0 : +newValue;
                
                if (options && options.precision !== undefined) {
                    newValueAsNum = parseFloat(newValueAsNum.toFixed(options.precision));
                }
                
                if (options && options.min !== undefined && newValueAsNum < options.min) {
                    newValueAsNum = options.min;
                }
                
                if (options && options.max !== undefined && newValueAsNum > options.max) {
                    newValueAsNum = options.max;
                }
                
                if (options && options.callback) {
                    const callbackResult = options.callback(newValue, current, newValueAsNum);
                    if (callbackResult !== null) {
                        newValueAsNum = callbackResult;
                    }
                }
                
                if (newValueAsNum !== current) {
                    target(newValueAsNum);
                } else {
                    target.notifySubscribers(newValueAsNum);
                }
            }
        }).extend({ notify: 'always' });
        
        result(target());
        return result;
    };
}

/**
 * Main application initialization
 * @param isFirstRun - Whether this is the first time running the application
 * @param configVersion - The version of the configuration
 */
function init(_isFirstRun: boolean, configVersion: string | null): void {
    // Initialize application
    configUpgrade(configVersion);

    (window as any).view.darkMode = new DarkMode();
    
    // Set up Knockout numeric extender
    setupNumericExtender();
    
    // Use the global params object (set by params.js)
    const params = (window as any).params;
    
    // Set up DLCs
    (window as any).view.dlcs = [];
    (window as any).view.dlcsMap = new Map();
    for (let dlc of (params.dlcs || [])) {
        const d = new (require('./util').DLC)(dlc);
        (window as any).view.dlcs.push(d);
        (window as any).view.dlcsMap.set(d.id, d);
        if (localStorage) {
            let id = "settings." + d.id;
            if (localStorage.getItem(id) != null)
                d.checked(parseInt(localStorage.getItem(id) || '0'));

            d.checked.subscribe((val: boolean) => localStorage.setItem(id, val ? '1' : '0'));
        }
    }

        // Set up options

        for (let attr in options) {
            let o = new Option(options[attr]);

            (window as any).view.settings[attr] = o;
            (window as any).view.settings.options.push(o);
    
            if (localStorage) {
                let id = "settings." + attr;
                if (localStorage.getItem(id) != null)
                    o.checked(parseInt(localStorage.getItem(id) || '0') ? true : false);
    
                o.checked.subscribe((val: boolean) => localStorage.setItem(id, val ? '1' : '0'));
            }
        }
    
        (window as any).view.settings.languages = params.languages;

    // Set up regions
    (window as any).view.regions = [];
    for (let region of (params.regions || [])) {
        const r = new (require('./world').Region)(region);
        (window as any).view.assetsMap.set(r.guid, r);
        (window as any).view.regions.push(r);
    }

    // Set up sessions
    (window as any).view.sessions = [];
    for (let session of (params.sessions || [])) {
        const s = new (require('./world').Session)(session, (window as any).view.assetsMap);
        (window as any).view.assetsMap.set(s.guid, s);
        (window as any).view.sessions.push(s);
    }

    // Set up NPC traders
    (window as any).view.productsToTraders = new Map();
    for (let t of (params.traders || [])) {
        const trader = new (require('./trade').NPCTrader)(t);

        for (let r of t.goodsProduction) {
            const route = Object.assign({}, r, { trader: trader });
            if ((window as any).view.productsToTraders.has(r.Good))
                (window as any).view.productsToTraders.get(r.Good).push(route);
            else
                (window as any).view.productsToTraders.set(r.Good, [route]);
        }
    }

    // Set up island management
    (window as any).view.islandManager = new (require('./world').IslandManager)(params, _isFirstRun);

    // Set up language persistence
    if (localStorage) {
        const id = "language";
        if (localStorage.getItem(id))
            (window as any).view.settings.language(localStorage.getItem(id));

        (window as any).view.settings.language.subscribe((val: string) => localStorage.setItem(id, val));
    }

    // Handle configuration upgrades
    if (!_isFirstRun)
        configUpgrade(configVersion);
    else
        localStorage.setItem("upgrade.bonusResidentsApplied", "1");

    // Set up modal dialogs and UI state
    (window as any).view.collapsibleStates = new (require('./views').CollapsibleStates)();
    (window as any).view.selectedFactory = ko.observable((window as any).view.island().factories[0]);
    (window as any).view.selectedPopulationLevel = ko.observable((window as any).view.island().populationLevels[0]);
    (window as any).view.productionChain = new (require('./views').ProductionChainView)((window as any).view.selectedFactory);
    (window as any).view.selectedMultiFactoryProducts = ko.observable((window as any).view.island().multiFactoryProducts);
    (window as any).view.selectedExtraGoodItems = ko.observable((window as any).view.island().extraGoodItems);
    (window as any).view.selectedResidenceEffectView = ko.observable(new (require('./views').ResidenceEffectView)([(window as any).view.island().residenceBuildings[0]]));

    // Set up trade manager
    (window as any).view.tradeManager = new (require('./trade').TradeManager)();

    // Set up templates
    const allIslands = (window as any).view.islandManager.allIslands;
    const selectedIsland = (window as any).view.island();
    const templates: any[] = [];
    const arrayToTemplate = (name: string) => allIslands[name].map((asset: any, index: number) => {
        const t = new (require('./views').Template)(asset, selectedIsland, name, index);
        templates.push(t);
        return t;
    });

    (window as any).view.island.subscribe((i: any) => templates.forEach(t => t.parentInstance(i)));

    (window as any).view.template = {
        populationLevels: arrayToTemplate("populationLevels"),
        categories: arrayToTemplate("categories"),
        consumers: arrayToTemplate("consumers"),
        publicServices: arrayToTemplate("publicServices"),
        publicRecipeBuildings: arrayToTemplate("publicRecipeBuildings")
    };

    // Set up view mode for first run
    if (_isFirstRun)
        (window as any).view.viewMode = new (require('./views').ViewMode)(_isFirstRun);

    // Register Knockout components (before bindings are applied)
    registerComponents();

    // Apply Knockout bindings
    ko.applyBindings((window as any).view, $(document.body)[0]);

    // Set up modal event handlers
    $('#factory-choose-dialog').on('show.bs.modal', () => {
        (window as any).view.selectedMultiFactoryProducts((window as any).view.island().multiFactoryProducts
            .filter((p: any) => p.availableFactories().length > 1)
            .sort((a: any, b: any) => a.name().localeCompare(b.name())));
    });

    $('#item-equipment-dialog').on('show.bs.modal', () => {
        (window as any).view.selectedExtraGoodItems((window as any).view.island().extraGoodItems);
    });

    $('*').on('hidden.bs.modal', () => {
        const input = $(':focus');
        if (input.length)
            input.blur();
        $('.modal-backdrop').remove();
        $('body').removeClass('modal-open');
        $('body').css('padding-right', '');
    });

    // Set up key bindings for navigation
    $(document).keydown((e: JQuery.KeyDownEvent) => {
        if (!$('input, textarea').is(':focus')) {
            switch (e.which) {
                case 37: // left
                    const prevButton = $('.island-navigation .fa-chevron-left').closest('button');
                    if (prevButton.length && !prevButton.prop('disabled'))
                        prevButton.click();
                    break;
                case 39: // right
                    const nextButton = $('.island-navigation .fa-chevron-right').closest('button');
                    if (nextButton.length && !nextButton.prop('disabled'))
                        nextButton.click();
                    break;
                default:
                    return;
            }
            e.preventDefault();
        }
    });

}

// Export functions for global access
export { factoryReset, exportConfig, init }; 

// Document ready handler - initialize the application when DOM is ready
$(document).ready(function () {
    const configVersion = localStorage && localStorage.getItem("versionCalculator");
    const isFirstRun = !localStorage || localStorage.getItem("versionCalculator") == null;

    // Parse the parameters (texts will be loaded from i18n)
    // Note: locaTexts parsing is handled in the i18n module
    
    // Parse the texts - create NamedElement instances for each text entry
    for (let attr in locaTexts) {
        (window as any).view.texts[attr] = new (require('./util').NamedElement)({ 
            name: attr, 
            guid: attr, // Use the attribute name as the GUID
            locaText: locaTexts[attr] 
        });
    }
    
    console.log('Loaded texts:', Object.keys((window as any).view.texts));
    console.log('Available locaTexts:', Object.keys(locaTexts));

    // Check for updates and show notifications
    checkAndShowNotifications();

    // Initialize the application
    init(isFirstRun, configVersion);

    // Set up Bootstrap popovers
    ($ as any)('[data-toggle="popover"]').popover();
    
    // Install import config listener (must occur after template binding)
    installImportConfigListener();
}); 