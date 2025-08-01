import { PopulationNeed } from './consumption';
import { Consumer } from './factories';
import { NumberInputHandler, EPSILON, ko } from './util';

declare const $: any;
declare const window: any;


// Function to register all components
function registerComponents(): void {
    // Ensure ko is available
    if (typeof ko === 'undefined') {
        console.error('Knockout is not loaded');
        return;
    }

    // Ensure components are available
    if (!ko.components) {
        console.error('Knockout components are not available, retrying in 100ms...');
        setTimeout(registerComponents, 100);
        return;
    }

    // Ensure components.register is available
    if (typeof ko.components.register !== 'function') {
        console.error('ko.components.register is not a function, retrying in 100ms...');
        setTimeout(registerComponents, 100);
        return;
    }

// Temporary type definitions until full conversion
interface Asset {
    icon?: string;
    name: string;
    guid: string;
    checked?: any;
    existingBuildings?: any;
    canEdit?: () => boolean;
    region?: any;
    populationLevel?: any;
    floorCount?: number;
}

// Removed unused Factory interface

interface Module {
    name(): string;
}

interface Demand {
    amount(): number;
    level?: any;
    consumer?: Consumer;
    module?: Module;
}

    /**
     * Custom Knockout binding handler for applying properties to descendant elements
     * Allows passing additional properties to child elements in the binding context
     */
    ko.bindingHandlers.withProperties = {
        init: function (element: HTMLElement, valueAccessor: () => any, _allBindings: any, _viewModel: any, 
    bindingContext: any) {
            // Make a modified binding context, with a extra properties, and apply it to descendant elements
            var innerBindingContext = bindingContext.extend(valueAccessor);
            ko.applyBindingsToDescendants(innerBindingContext, element);

            // Also tell KO *not* to bind the descendants itself, otherwise they will be bound twice
            return { controlsDescendantBindings: true };
        }
    };

    /**
     * Number input component with increment/decrement buttons
     * Provides vertical buttons for adjusting numeric values with step increments
     */
    ko.components.register('number-input-increment', {
    viewModel: {
        // - 'params' is an object whose key/value pairs are the parameters
        //   passed from the component binding or custom element
        // - 'componentInfo.element' is the element the component is being
        //   injected into. When createViewModel is called, the template has
        //   already been injected into this element, but isn't yet bound.
        // - 'componentInfo.templateNodes' is an array containing any DOM
        //   nodes that have been supplied to the component. See below.
        createViewModel: (params: any, _componentInfo: any) => new NumberInputHandler(params)
    },
    template:
        `<div class="input-group-btn-vertical" >
                                                        <button class="btn btn-default" type="button" data-bind="click: (_, evt) => {var factor = getInputFactor(evt); var val = parseFloat(obs()) + factor * step + ACCURACY; obs(Math.floor(val/step)*step)}, enable: obs() < max"><i class="fa fa-caret-up"></i></button>
                                                        <button class="btn btn-default" type="button" data-bind="click: (_, evt) => {var factor = getInputFactor(evt); var val = parseFloat(obs()) - factor * step - ACCURACY; obs(Math.ceil(val/step)*step)}, enable: obs() > min"><i class="fa fa-caret-down"></i></button>
                                                    </div>`
});

    /**
     * Notes section component for displaying and editing text notes
     * Shows a textarea for entering notes when the data object has a notes property
     */
    ko.components.register('notes-section', {
        template:
            `<div class="form-group notes-section" data-bind="if: $data != null && $data.notes != null">
                  <textarea class="form-control" data-bind="textInput: $data.notes, attr: {placeholder: $root.texts.notes.name()}"></textarea>
            </div>`
    });

    /**
     * Lock toggle component for switching between locked/unlocked states
     * Displays different icons based on the checked state and allows toggling
     */
    ko.components.register('lock-toggle', {
        template:
            `<div style="cursor: pointer" data-bind="click: () => {checked(!checked());}">
                 <img class="icon-sm icon-light" src="icons/icon_unlock.png" data-bind="style: {display : checked()? 'none' : 'inherit'}">
                 <img class="icon-sm icon-light" src="icons/icon_lock.png" style="display: none;"  data-bind="style: {display : checked()? 'inherit' : 'none'}">
            </div>`
    });

    /**
     * Asset icon component for displaying icons with fallback handling
     * Shows an icon for an asset with proper alt text and title attributes
     * @param asset - The asset object containing icon and name properties
     */
    ko.components.register('asset-icon', {
    viewModel: function (asset: Asset) {
        this.asset = asset;
    },
    template: `<img class="icon-sm" src="" data-bind="attr: { src: asset.icon ? asset.icon : null, alt: asset.name, title: asset.name}">`
});

/**
 * Factory header component for displaying factory information with optional configuration button
 * Shows factory name, icon, region icon, and optionally a configuration button
 * @param params - Component parameters
 * @param params.data - The factory data object
 * @param params.button - Whether to show the configuration button
 */
(ko as any).components.register('factory-header', {
    viewModel: function (params: any) {
        this.$data = params.data;
        this.hasButton = params.button;
        this.$root = window.view;
    },
    template:
        `<div class="ui-fchain-item-tr-button" data-bind="if: hasButton">
            <div>
                <button class="btn btn-light btn-sm" data-bind="click: () => {$root.selectedFactory($data.instance())}" data-toggle="modal" data-target="#factory-config-dialog">
                    <span class="fa fa-sliders"></span>
                </button>
            </div>
        </div>

        <div class="ui-fchain-item-name" data-bind="text: $data.name, visible: !$root.settings.hideNames.checked()"></div>

        <div class="ui-fchain-item-icon mb-2">
            <img class="icon-tile" data-bind="attr: { src: $data.icon ? $data.icon : null, alt: $data.name }">
            <img class="superscript-icon icon-light" data-bind="visible: $data.region, attr: {src: $data.region ? $data.region.icon : null, title: $data.region ? $data.region.name : null}">
        </div>`
});

/**
 * Residence label component for displaying residence information
 * Shows population level icon, residence icon, and floor count
 * @param residence - The residence building object
 */
(ko as any).components.register('residence-label', {
    viewModel: function (residence: Asset) {
        this.residence = residence;
    },
    template:
        `<div class="inline-list mr-3" data-bind="attr: {title: residence.name}">
            <div data-bind="component: {name: 'asset-icon', params: residence.populationLevel}"></div>
            <div data-bind="component: {name: 'asset-icon', params: residence}"></div>
            <div data-bind="text: residence.floorCount"></div>
        </div>`
});

/**
 * Residence effect entry component for displaying consumption effects
 * Shows product icons with consumption modifiers, resident bonuses, and supply information
 * @param params - Component parameters
 * @param params.entries - Array of effect entries to display
 * @param params.filter - Optional filter for products to show
 */
(ko as any).components.register('residence-effect-entry', {
    viewModel: function (params: any) {
        this.entries = params.entries;
        this.filter = params.filter;
        this.texts = window.view.texts;
    },
    template:
        `<div class="inline-list-centered" data-bind="foreach: entries">
             <div class="inline-list mr-3" data-bind="if: product.available() && ($parent.filter == null || $parent.filter.has(product))">
                <div data-bind="component: { name: 'asset-icon', params: product}" ></div>
                <div data-bind="if: consumptionModifier !== 0">
                    <img class="icon-sm icon-light ml-1" src="icons/icon_marketplace_2d_light.png" data-bind="attr: {title: $parent.texts.reduceConsumption.name}">
                    <span data-bind="text: formatPercentage(consumptionModifier)"></span>
                </div>
                <div data-bind="if: residents !== 0">
                    <img class="icon-sm icon-light ml-1" src="icons/icon_resource_population.png" data-bind="attr: {title: $parent.texts.bonusResidents.name}">
                    <span data-bind="text: '+' + residents"></span>
                </div>
                <div class="inline-list" data-bind="if: suppliedBy.length !== 0">
                    <img class="icon-sm icon-light ml-1" src="icons/icon_transfer_goods_light.png" data-bind="attr: {title: $parent.texts.bonusSupply.name}">
                    <div class="inline-list" data-bind="foreach: {data: suppliedBy, as: 'product'}">
                        <span data-bind="component: {name: 'asset-icon', params: product}"></span>
                    </div>
                </div>
            </div>
        </div>
        `
});

/**
 * Replacement component for showing input/output replacements
 * Displays old and new items with a transition arrow between them
 * @param params - Component parameters
 * @param params.old - The old item being replaced
 * @param params.new - The new item replacing the old one
 */
(ko as any).components.register('replacement', {
    viewModel: function (params: any) {
        this.old = params.old;
        this.replacing = params.new;
    }, template:
        ` <div class="ui-fchain-item-icon-replacement">
            <span class="strike-through">
                <img class="icon-sm" src="" data-bind="attr: { src: old.icon ? old.icon : null, alt: old.name }">
            </span>
            <!-- ko if: replacing -->
            <div class="ui-replacement-spacer">
                    &rarr;
            </div>
            <div>
                <img class="icon-sm" src="" data-bind="attr: { src: replacing.icon ? replacing.icon : null, alt: replacing.name }">
            </div>
            <!-- /ko -->
        </div>`
});

/**
 * Existing buildings input component for setting building counts
 * Provides a numeric input with increment/decrement buttons for existing building counts
 * @param asset - The asset object to configure existing buildings for
 */
(ko as any).components.register('existing-buildings-input', {
    viewModel: function (asset: Asset) {
        this.asset = asset;
        this.texts = window.view.texts;
    }, template:
        `<div class="input-group input-group-short spinner float-left" style="max-width: 10rem;">
            <div class="input-group-prepend" data-bind="src: {title: texts.residences.name()}">
                <div class="input-group-text">
                    <img class="icon-sm icon-light" src="icons/icon_house_white.png" />
                </div>
            </div>
            <input class="form-control" type="number" value="0" step="1" min="0" data-bind="value: asset.existingBuildings, enable: asset.canEdit == null || asset.canEdit(), attr: {id: asset.guid + '-existing-buildings-input'}" />
            <div class="input-group-append">
                <div data-bind="component: { name: 'number-input-increment', params: { obs: asset.existingBuildings, id: asset.guid + '-existing-buildings-input' }}"></div>
            </div>
        </div>`
});

/**
 * Icon checkbox component for selectable items with icons
 * Displays a checkbox with an icon and label for selecting items
 * @param params - Component parameters
 * @param params.asset - The asset object
 * @param params.checked - The checked state observable
 * @param params.id - Optional custom ID for the checkbox
 * @param params.title - Optional custom title
 */
(ko as any).components.register('icon-checkbox', {
    viewModel: function (params: any) {
        this.asset = params.asset;
        this.checked = params.checked || this.asset.checked;
        this.id = params.id || this.asset.guid;
        this.title = params.title || this.asset.name
    }, template:
        `<div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" data-bind="checked: checked, attr: { 'id': id, 'title': title() }">
            <label class="custom-control-label" data-bind="attr: { for: id }" src-only style="vertical-align: top;">
                <span class="mr-2" style="flex-basis: fit-content;">
                    <img class="icon-sm" src="" data-bind="attr: { src: asset.icon ? asset.icon  : null, alt: title(), for: id }" />
                </span>
            </label>
        </div>`
});

/**
 * Additional output component for displaying extra goods production
 * Shows an icon and amount for additional goods produced by factories
 * @param params - Component parameters
 * @param params.amount - The amount of additional goods
 */
(ko as any).components.register('additional-output', {
    viewModel: function (params: any) {
        this.amount = params.amount;
        this.texts = window.view.texts;
    }, template:
        `<div data-bind="src: { title: texts.extraGoods.name}">
            <img class="icon-sm icon-light mr-2" src="icons/icon_add_goods_socket_white.png"/>
            <span data-bind="text: formatNumber(amount()) + ' t/min'"></span>
        </div>`
});

/**
 * Collapsible section component for expandable/collapsible content
 * Provides a fieldset with a clickable legend that can show/hide content
 * @param params - Component parameters
 * @param params.id - Unique ID for the collapsible section
 * @param params.heading - The heading text for the section
 * @param params.collapsed - Initial collapsed state
 * @param params.fieldsetClass - CSS class for the fieldset
 * @param params.data - Data to pass to the template
 * @param params.checkbox - Optional checkbox for selecting all items
 * @param params.summary - Optional summary value to display
 * @param params.colorSummary - Whether to color the summary based on value
 */
(ko as any).components.register('collapsible', {
    viewModel: function (params: any) {
        this.target = '#' + params.id;
        this.heading = params.heading;
        this.collapser = window.view.collapsibleStates.get(params.id, params.collapsed);
        this.cssClass = ko.pureComputed(() => this.collapser.collapsed() ? "hide" : "show");
        this.fieldsetClass = params.fieldsetClass ? params.fieldsetClass : "collapsible-section";
        this.data = params.data;
        this.hasCheckbox = false;

        if (params.checkbox) {
            this.hasCheckbox = true;
            if (ko.isWriteableObservable(params.checkbox))
                this.checked = params.checkbox;
            else {
                this.items = params.checkbox;
                this.checked = ko.pureComputed({
                    read: () => {
                        for (var n of this.items)
                            if (!n.checked())
                                return false;

                        return true;
                    },
                    write: (checked: boolean) => {
                        for (var n of this.items)
                            n.checked(checked);
                    }
                })
            }
        }

        this.hasSummary = false;
        if (params.summary) {
            this.hasSummary = true;
            this.summary = params.summary;
            if (params.colorSummary) {
                this.summaryWithSign = true;
                this.summaryClass = ko.pureComputed(() => {
                    if (Math.abs(this.summary()) < EPSILON)
                        return "";

                    return this.summary() < 0 ? "amount-negative" : "amount-positive"
                })
            } else {
                this.summaryWithSign = false;
                this.summaryClass = ko.observable("");
            }
        }

        setTimeout(() => {
            $(this.target).on("hidden.bs.collapse shown.bs.collapse", (_event: any) => {
                this.collapser.collapsed(!$(this.target).hasClass("show"));
            });
        });

    }, template:
        `<fieldset class="mt-4" data-bind="class: fieldsetClass">
            <legend class="collapser collapsed" data-toggle="collapse" data-bind="attr: {'data-target' : target}, css: {'collapsed' : collapser.collapsed()}">
                <div class="summary" data-bind="if: hasSummary">
                    <span class="float-right" data-bind="class: summaryClass">
                        <span data-bind="text: formatNumber(summary(), summaryWithSign)"></span>
                        <span> t/min</span>
                    </span>
                </div>
                <span class="fa fa-chevron-right"></span>
                <span class="fa fa-chevron-down"></span>
                <!-- ko if: !hasCheckbox -->
                <span data-bind="text:heading"></span>
                <!-- /ko -->
                <!-- ko if: hasCheckbox -->
                <span class="custom-control custom-checkbox ml-1" style="display: initial">
                    <input type="checkbox" class="custom-control-input" data-bind="checked: checked, attr: { id: target + '-check-all' }">
                    <label class="custom-control-label" data-bind="attr: {for: target + '-check-all'}">
                        <span data-bind="text:heading"></span>
                    </label>
                </span>
                <!-- /ko -->   
            </legend>
            <div class="collapse" data-bind="attr: {'id' : collapser.id}, class: cssClass">
                <!-- ko template: { nodes: $componentTemplateNodes, data: data } --><!-- /ko -->
                <div class="clear"></div>
            </div>
          </fieldset>
            `
});

/**
 * Consumer unknown component for displaying unknown consumer types
 * Fallback component when consumer type is not recognized
 */
(ko as any).components.register('consumer-unknown', {
    template: `<span>?</span>`
});

/**
 * Consumer population component for displaying population level consumers
 * Shows population level icon and name, clickable to open population configuration
 * @param demand - The population demand object
 */
(ko as any).components.register('consumer-population', {
    template:
        `<div class="inline-list" style="cursor: pointer" data-dismiss="modal" data-bind="click: () => {setTimeout(() => { $root.selectedPopulationLevel($data.level); $('#population-level-config-dialog').modal('show')}, 500);}" >
            <div data-bind="component: {name: 'asset-icon', params: $data.level}"></div>
            <span class="ml-2" data-bind="text: $data.level.name"></span>
        </div>`
});

/**
 * Consumer factory component for displaying factory consumers
 * Shows factory icon and name, clickable to open factory configuration
 * @param demand - The factory demand object
 */
(ko as any).components.register('consumer-factory', {
    template:
        `<div class="inline-list" style="cursor: pointer" data-bind="click: () => {$root.selectedFactory($data.consumer);}" >
            <div data-bind="component: {name: 'asset-icon', params: $data.consumer}"></div>
            <span class="ml-2" data-bind="text: $data.consumer.getRegionExtendedName()"></span>
        </div>`
});

/**
 * Consumer module component for displaying module consumers
 * Shows factory icon, module icon, and combined name, clickable to open factory configuration
 * @param demand - The module demand object
 */
(ko as any).components.register('consumer-module', {
    template:
        `<div class="inline-list" style="cursor: pointer" data-bind="click: () => {$root.selectedFactory($data.consumer);}" >
            <div data-bind="component: {name: 'asset-icon', params: $data.consumer}"></div>
            <div class="ml-2" data-bind="component: {name: 'asset-icon', params: $data.module}"></div>
            <span class="ml-2" data-bind="text: $data.module.name() + ': ' + $data.consumer.getRegionExtendedName()"></span>
        </div>`
});

/**
 * Consumer entry component for displaying different types of consumers
 * Dynamically selects the appropriate consumer component based on demand type
 * @param demand - The demand object to display
 */
(ko as any).components.register('consumer-entry', {
    viewModel: function (demand: Demand) {
        this.demand = demand;

        this.component = "consumer-unknown";

        if (this.demand instanceof PopulationNeed)
            this.component = "consumer-population";
        else if (this.demand.module)
            this.component = "consumer-module";
        else if (this.demand.consumer instanceof Consumer)
            this.component = "consumer-factory";

    }, template:
        `<div data-bind="component: { name: component, params: demand}"></div>`
});

/**
 * Consumer view component for displaying a list of factory demands
 * Shows a table of all demands for a factory with their amounts
 * @param params - Component parameters
 * @param params.factory - The factory to display demands for
 */
(ko as any).components.register('consumer-view', {
    viewModel: function (params: any) {
        this.factory = params.factory;
        this.populationLevelIndices = new Map();
        this.factory.island.populationLevels.forEach((l: any, i: number) => this.populationLevelIndices.set(l.guid, i));

        this.demands = ko.pureComputed(() => {
            var demands = this.factory.demands().filter((d: Demand) => d.amount() > EPSILON);
            return demands.sort((a: Demand, b: Demand) => {
                if (a instanceof PopulationNeed && b instanceof PopulationNeed)
                    return this.populationLevelIndices.get(a.level!.guid) - this.populationLevelIndices.get(b.level!.guid);

                if (a instanceof PopulationNeed)
                    return -1000;

                if (b instanceof PopulationNeed)
                    return 1000;

                if (a.consumer && b.consumer)
                    return a.consumer.name().localeCompare(b.consumer.name());

                if (a.consumer)
                    return -1000;

                if (b.consumer)
                    return 1000;

                return b.amount() - a.amount();
            });
        });

    }, template:
        //        `<div data-bind="component: { name: component, params: demand}"></div>`
        `<table class="table table-striped">
            <tbody data-bind="foreach: demands">
                <tr>
                    <td>
                        <div data-bind="component: { name: 'consumer-entry', params: $data}"></div>
                    </td>
                    <td>
                        <div class="float-right">
                            <span data-bind="text: formatNumber($data.amount())"></span>
                            <span> t/min</span>
                        </div>
                    </td>

                </tr>
            </tbody>
         </table>`
}); 
}

// Export the function so it can be called from main.ts
export { registerComponents };