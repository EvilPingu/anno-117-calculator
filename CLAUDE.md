# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Anno 117 Calculator is a web-based calculator for the computer game Anno 117, built to compute production chains and resource consumption based on population requirements. The migration from JavaScript to TypeScript has been completed, with legacy JavaScript files in the `js/` directory serving as reference only.

## Development Commands

### Build Commands
- `npm run build` - Build the project with webpack
- `npm run build:ts` - TypeScript compilation only
- `npm run dev` - Development mode with webpack watch
- `npm run type-check` - TypeScript type checking without emitting files
- `npm run type-check:watch` - TypeScript type checking in watch mode

### Migration Scripts
- `npm run migrate` - Run TypeScript migration helper
- `npm run fix-types` - Fix TypeScript errors automatically
- `npm run fix-critical` - Fix critical TypeScript errors
- `npm run quick-fix` - Apply quick TypeScript fixes
- `npm run generate-types` - Generate type definitions from params

## Project Architecture

### Dual Source Structure
The project maintains both JavaScript (legacy) and TypeScript (target) versions:
- `js/` - Original JavaScript files (legacy, still referenced by webpack aliases)
- `src/` - TypeScript source files (target)
- `dist/` - Compiled output directory

### Core Modules
- **main.ts** - Application entry point, initializes knockout bindings and global state
- **types.ts** - Comprehensive type definitions for all interfaces and configurations
- **util.ts** - Base classes (NamedElement, DLC, Option) and utility functions
- **params.ts** - Game configuration data (generated from Anno 117 assets)
- **population.ts** - Population management and residence calculations
- **factories.ts** - Production building and factory logic
- **world.ts** - Session, region, and island management
- **trade.ts** - Trade route and NPC trader management
- **views.ts** - UI view models and dialogs
- **components.ts** - Knockout component registration
- **i18n.ts** - Internationalization and text management
- **production.ts** - Product, Demand, and Buff management classes
- **buffs.ts** - AppliedBuff and ExtraGoodProduction classes (separated to resolve circular imports)

### Key Design Patterns
- **Knockout.js MVVM** - Uses observables for reactive UI updates
- **Global State Management** - `window.view` object contains all application state
- **Configuration-Driven** - All game data loaded from `params.ts` configuration
- **Module System** - Mix of ES6 imports and AMD requires for compatibility

### Template System
HTML templates are loaded from `templates/` directory via webpack context and registered as Knockout templates.

## TypeScript Migration Status

Migration completed. Legacy JavaScript files in `js/` are reference-only.

### Build Process
- Entry: `src/main.ts` → Output: `dist/calculator.bundle.js`
- External deps: Knockout, jQuery, Bootstrap loaded globally
- Templates loaded via webpack's require.context()

## Key Files
- @src/main.ts:292 - `init()` function, main initialization sequence
- @src/types.ts - Type definitions for all interfaces
- @docs/DEVELOPER_GUIDE.md - Complete development documentation
## Testing and Validation

Always run type checking after making changes:
```bash
npm run type-check
```

For build validation:
```bash
npm run build
```

## UI Design Guidelines (IMPLEMENTED)

### Template Styling Standards
- **Use Project-Specific Classes**: Prefer `inline-list-centered` over `d-flex align-items-center` for consistency with project styles
- **Residents Display Pattern**: Always display total residents as read-only text with `formatNumber()`, never as number input
- **Icon-First Design**: Use visual icons (`icon_resource_population.png`, `icon_house_white.png`) instead of text headers
- **Conditional Content**: Show residence type names only when multiple residences exist per population level
- **Visual Hierarchy**: Distinguish editable inputs (buildings) from calculated displays (residents) through styling

### Table Header Improvements
- Remove traditional table headers for cleaner UI
- Use `table-striped table-fixed` classes for consistent column widths  
- Implement icon-based column identification
- Apply subtle backgrounds (`rgba(0,0,0,0.05)`) for grouping related information

## Architecture Notes
- `types.config.ts` is generated - never edit directly
- Use `number-input-increment` for numeric inputs
- Most assets created per island; regions/sessions/buffs are global
- Circular imports: production.ts → buffs.ts ← factories.ts

## Critical Initialization Order (world.ts:518)
1. Create objects (consumers, factories, products)
2. `f.initDemands(assetsMap)` - factories register in products  
3. `e.applyBuffs(assetsMap)` - effects create AppliedBuff for targets
4. `persistBuildings()` - load saved configurations

## Debugging Knockout Errors
- **Template errors**: Check `ko.templates` object, add null checks
- **Effects missing**: Wrong initialization order (applyBuffs before initDemands)  
- **Components broken**: Call registerComponents() before ko.applyBindings()

Quick debug: `console.log(Object.keys(ko.templates), window.view.island().factories[0].buffs.length)`
## Design System and Typography

### Font Configuration
- **Primary Font**: Pelago (`pelago-regular.otf`) for all body text and UI elements
- **Heading Font**: Albertus Nova for headings (h1, legends) and special emphasis
- **Base Font Size**: 16px (increased from 14px for better readability)
- **Font Loading**: Use `@font-face` with `font-display: swap` for performance
- **Letter Spacing**: Applied subtle letter-spacing to improve readability

### Color Scheme (Warm Earth Tones)
- **Body Background**: `#d4b89b` (warm brown)
- **Navbar Background**: `#ffe9de` (light peachy cream)
- **Input Fields**: `#c4a485` (darker tone, ~10% darker than body)
- **Modal Dialogs**: Dark blue theme
  - Content: `#2c3e50` (medium dark blue)
  - Header/Footer: `#1a252f` (darker blue)
  - Text: `#ecf0f1` (light blue-gray)
- **UI Components**: Semi-transparent navbar color `rgba(255, 233, 222, 0.9)`

### CSS Component Patterns
- **Form Controls**: Use consistent background `#c4a485` and border `#abb8c3`
- **Custom Selects**: Match form control styling for consistency
- **Modal Separation**: Dark blue modals contrast with warm main theme
- **Button Text Color**: CRITICAL - Button text color should be white/light, not transparent
- **Number Input Increment**: Maintain consistent width (16px) across light/dark modes

### Font Size Hierarchy
- **Body**: 16px (Pelago)
- **H1**: 40px (Albertus Nova)
- **Legends**: 22px (Albertus Nova)
- **UI Components**: 13-14px (factory names, amounts, etc.)
- **Small Text**: 11-12px (load indicators, help text)
- **Input Groups**: 0.8rem

## Generated File Notes

- Items create AppliedBuff for each target. This tracks whether the effect is applied to the specific factory in AppliedBuff.scaling (knockout observable storing a float).
- Initialization order in island constructor is important. Buffs register in factories. Factories register in products. Therefore, initDemands and applyBuffs exist to establish the links after objects are created. Only after that values are loaded from localStorage (as part of calling the persist* method)
- Most assets are created for each island. Only some (regions, seesions, buffs, need categories) only exist once globally.
- Avoid to use `as any` casts when generating code. Do not use them to fix typescript errors.
- Use inline-list* classes from styles.css when creating floating divs.