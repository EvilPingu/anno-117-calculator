# Anno 1800 Calculator - JavaScript to TypeScript Migration Guide

## Overview

This guide outlines the process of converting the Anno 1800 Calculator project from JavaScript to TypeScript for improved type safety and developer experience.

## Project Structure

### Original Structure (JavaScript)
```
js/
├── main.js          # Main application entry point
├── util.js          # Utility functions and base classes
├── i18n.js          # Internationalization
├── population.js    # Population management
├── factories.js     # Factory and production logic
├── trade.js         # Trade system
├── world.js         # World and session management
├── views.js         # UI views and components
├── components.js    # Knockout components
└── params.js        # Configuration data (generated)
```

### New Structure (TypeScript)
```
src/
├── main.ts          # Main application entry point
├── util.ts          # Utility functions and base classes
├── types.ts         # Type definitions
├── i18n.ts          # Internationalization
├── population.ts    # Population management
├── factories.ts     # Factory and production logic
├── trade.ts         # Trade system
├── world.ts         # World and session management
├── views.ts         # UI views and components
├── components.ts    # Knockout components
└── params.ts        # Configuration data (generated)
```

## Configuration Files

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowJs": true,
    "checkJs": false
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "js"
  ]
}
```

### Webpack Configuration (webpack.config.js)
```javascript
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'calculator.bundle.js',
    charset: true
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/, 
        use: 'ts-loader',
        exclude: /node_modules/
      },
      { 
        test: /\.html$/, 
        use: 'html-loader' 
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
        "knockout-amd-helpers": path.join( __dirname, "js/knockout-amd-helpers.min.js" ),
        "knockout": path.join( __dirname, "js/knockout-min.js" ),
    }
  },
  optimization: {
    minimize: true
  }
};
```

### Package.json Dependencies
```json
{
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/knockout": "^3.4.72",
    "@types/jquery": "^3.5.29",
    "ts-loader": "^9.5.1"
  }
}
```

## Type Definitions

### Core Types (src/types.ts)
The project includes comprehensive type definitions for:
- Configuration interfaces for all major classes
- Knockout observable types
- Global window object extensions
- Asset map types

## Migration Steps

### 1. Install Dependencies
```bash
npm install --save-dev typescript @types/knockout @types/jquery ts-loader
```

### 2. Create TypeScript Configuration
- Copy the provided `tsconfig.json`
- Update `webpack.config.js` to handle TypeScript files

### 3. Convert Files Incrementally

#### Step 1: Convert util.js to util.ts
- Add type annotations to all functions and classes
- Replace `@ts-check` comments with proper TypeScript
- Add explicit parameter validation in constructors
- Replace generic property copying with explicit assignments

#### Step 2: Convert main.js to main.ts
- Add type annotations to all functions
- Handle global object assignments with proper typing
- Add proper error handling for async operations

#### Step 3: Convert remaining modules
- Convert each module one at a time
- Add proper interfaces for configuration objects
- Ensure all constructors have explicit parameter validation
- Replace `$.extend` and similar generic copying with explicit assignments

### 4. Update Import/Export Statements
- Replace `require()` with `import` statements where appropriate
- Keep `require()` for Knockout and AMD modules
- Use proper TypeScript module syntax

### 5. Handle Global Objects
- Add proper type declarations for global objects like `window.view`
- Use type assertions where necessary for external libraries
- Declare global interfaces in `types.ts`

## Key Migration Patterns

### Constructor Improvements
```typescript
// Before (JavaScript)
constructor(config) {
    $.extend(this, config);
}

// After (TypeScript)
constructor(config: NamedElementConfig) {
    if (!config) {
        throw new Error('NamedElement config is required');
    }
    if (!config.name) {
        throw new Error('NamedElement config.name is required');
    }
    
    // Explicit assignments
    this.name = ko.observable(config.name);
    this.guid = config.guid;
    this.dlcs = config.dlcs || [];
}
```

### Type-Safe Observables
```typescript
// Before
this.amount = ko.observable(0);

// After
public amount: KnockoutObservable<number> = ko.observable(0);
```

### Configuration Interfaces
```typescript
export interface NamedElementConfig {
    name: string;
    guid: string;
    dlcs?: string[];
    available?: boolean;
    notes?: string;
}
```

## Build Commands

### Development
```bash
npm run dev          # Webpack watch mode
npm run type-check   # TypeScript type checking
```

### Production
```bash
npm run build        # Build for production
npm run build:ts     # TypeScript compilation only
```

## Common Issues and Solutions

### 1. Knockout Type Issues
- Use `(ko as any)` for Knockout extensions
- Add proper type declarations for custom bindings
- Use `KnockoutObservable<T>` types

### 2. jQuery Type Issues
- Install `@types/jquery` for proper typing
- Use `JQuery.ChangeEvent` for event handlers
- Cast jQuery objects when necessary

### 3. Global Object Access
- Declare global interfaces in `types.ts`
- Use `(window as any)` for global assignments
- Add proper type guards for optional properties

### 4. Module Resolution
- Use `(require as any).context()` for webpack context
- Keep AMD modules as-is for Knockout compatibility
- Use proper import/export syntax for TypeScript modules

## Testing the Migration

### 1. Type Checking
```bash
npm run type-check
```

### 2. Build Testing
```bash
npm run build
```

### 3. Runtime Testing
- Test all calculator functionality
- Verify UI components work correctly
- Check that all data loading works

## Benefits of TypeScript Migration

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Improved autocomplete and refactoring
3. **Documentation**: Types serve as inline documentation
4. **Maintainability**: Easier to understand and modify code
5. **Refactoring**: Safer refactoring with type checking

## Next Steps

1. Complete the conversion of all remaining modules
2. Add comprehensive unit tests with TypeScript
3. Implement strict type checking gradually
4. Add JSDoc comments for better documentation
5. Consider using more advanced TypeScript features

## Notes

- The `params.js` file is generated by an external program and should be converted to `params.ts`
- Some Knockout-specific patterns may require type assertions
- Global objects like `window.view` need proper type declarations
- The migration can be done incrementally without breaking existing functionality 