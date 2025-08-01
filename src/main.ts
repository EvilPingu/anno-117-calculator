import { ACCURACY, formatNumber, formatPercentage, versionCalculator } from './util';
import { languageCodes, texts as locaTexts } from './i18n';
import { registerComponents } from './components';


// Import the missing modules (these will be stubs for now)
import './params';
import { Island } from './types';

declare const $: any;
declare const window: any;
declare const ko: any;



// Remove AMD helpers and module binding setup
// (No code for ko.bindingHandlers.module or ko.amdTemplateEngine should remain)
// The rest of the file remains unchanged.




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
        options: [],
        serverOptions: [],
        serverAddress: ko.observable(localStorage.getItem('serverAddress')||'localhost'),
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
        powerPlants: [],
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

            fileReader.readAsText(file);
        });
    }
}

/**
 * Loads and registers all templates with Knockout
 * Reads template files and registers them as named templates
 */
function loadTemplates(): void {
    // Template context for webpack
    const templateContext = (require as any).context("../templates", true, /\.html$/);
    
    // Get all template files
    const templateFiles = templateContext.keys();
    
    for (const templatePath of templateFiles) {
        // Extract template name from path (remove ./ and .html)
        const templateName = templatePath.replace(/^\.\//, '').replace(/\.html$/, '');
        
        // Get template content
        const templateContent = templateContext(templatePath);
        
        // Create a script element to register the template
        const script = document.createElement('script');
        script.type = 'text/html';
        script.id = templateName;
        script.innerHTML = templateContent.default || templateContent;
        document.head.appendChild(script);
    }
    
    console.log(`Loaded ${templateFiles.length} templates:`, templateFiles);
}

/**
 * Main application initialization
 * @param isFirstRun - Whether this is the first time running the application
 * @param configVersion - The version of the configuration
 */
function init(_isFirstRun: boolean, configVersion: string | null): void {
    // Initialize application
    configUpgrade(configVersion);
    
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
        console.log('Creating session with config:', session);
        const s = new (require('./world').Session)(session, (window as any).view.assetsMap);
        (window as any).view.assetsMap.set(s.guid, s);
        (window as any).view.sessions.push(s);
    }

    // Set up island management
    (window as any).view.islandManager = new (require('./world').IslandManager)(params, _isFirstRun);
    
    // Populate the islands observable array
    if ((window as any).view.islandManager && (window as any).view.islandManager.allIslands) {
        (window as any).view.islands((window as any).view.islandManager.allIslands);
    }
    
    // Set the current island - ensure we always have a valid island
    if ((window as any).view.islandManager && (window as any).view.islandManager.allIslands && (window as any).view.islandManager.allIslands.length > 0) {
        (window as any).view.island((window as any).view.islandManager.allIslands[0]);
        (window as any).view.island.subscribe((island: any) => {
            console.log('Island changed:', island);
        });
    }

    // Set up selected items
    if ((window as any).view.island()) {
        const island = (window as any).view.island();
        if (island.factories && island.factories.length > 0) {
            (window as any).view.selectedFactory(island.factories[0]);
        }
        if (island.populationLevels && island.populationLevels.length > 0) {
            (window as any).view.selectedPopulationLevel(island.populationLevels[0]);
        }
    }
    
    // Set up trade manager
    (window as any).view.tradeManager = new (require('./trade').TradeManager)();
    
    // Set up event listeners
    installImportConfigListener();
    
    // Check for updates
    checkAndShowNotifications();
    
    // Load templates before applying bindings
    loadTemplates();
    
    // Apply Knockout bindings
    ko.applyBindings((window as any).view, $(document.body)[0]);
    
    // Register Knockout components (after bindings are applied)
    registerComponents();
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