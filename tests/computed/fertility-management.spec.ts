import { test, expect } from '@playwright/test';
import { ConfigLoader } from '../helpers/config-loader';
import { ComputedValueAsserter } from '../helpers/computed-asserter';

test.describe('Fertility Management Tests', () => {
  let configLoader: ConfigLoader;
  let asserter: ComputedValueAsserter;

  test.beforeEach(async ({ page }) => {
    configLoader = new ConfigLoader();
    asserter = new ComputedValueAsserter();
    await configLoader.loadConfig(page, 'tests/fixtures/with-data.json');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.waitForFunction(() => (window as any).view && (window as any).view.island());
  });

  test('IslandFertility factor is 1.0 when checked is true', async ({ page }) => {
    const factor = await page.evaluate(() => {
      const island = (window as any).view.island();
      const firstFertility = Array.from(island.islandFertilities.values())[0] as any;
      firstFertility.checked(true);
      return firstFertility.factor();
    });

    expect(factor).toBe(1.0);
  });

  test('IslandFertility factor reflects area buffs when unchecked', async ({ page }) => {
    const results = await page.evaluate(() => {
      const island = (window as any).view.island();
      // Find a fertility that has at least one area buff
      const islandFertility = Array.from(island.islandFertilities.values()).find((f: any) => {
        const relevantBuffs = island.areaBuffs.filter((b: any) => b.addedFertility?.guid === f.fertility.guid);
        return relevantBuffs.length > 0;
      }) as any;

      if (!islandFertility) return { skip: true };

      islandFertility.checked(false);
      const initialFactor = islandFertility.factor();

      const relevantBuffs = island.areaBuffs.filter((b: any) => b.addedFertility?.guid === islandFertility.fertility.guid);
      relevantBuffs[0].scaling(1); // Enable first area buff
      const factorWithOneBuff = islandFertility.factor();
      const buffPercent = relevantBuffs[0].fertilityPercent;

      return { 
        skip: false, 
        initialFactor, 
        factorWithOneBuff, 
        expectedFactor: Math.min(1.0, buffPercent / 100) 
      };
    });

    if (!results.skip) {
      expect(results.initialFactor).toBe(0);
      expect(results.factorWithOneBuff).toBe(results.expectedFactor);
    }
  });

  test('factory boost is multiplied by fertility factor', async ({ page }) => {
    const boostData = await page.evaluate(() => {
      const island = (window as any).view.island();
      const factory = island.factories.find((f: any) => f.neededFertility) as any;
      if (!factory) return { skip: true };

      const islandFertility = island.getIslandFertility(factory.neededFertility.guid);
      islandFertility.checked(true);
      const boostFull = factory.boost();

      islandFertility.checked(false);
      // Ensure no area buffs are active for this fertility
      island.areaBuffs.filter((b: any) => b.addedFertility?.guid === factory.neededFertility.guid)
        .forEach((b: any) => b.scaling(0));
      
      const boostZero = factory.boost();

      return { skip: false, boostFull, boostZero };
    });

    if (!boostData.skip) {
      expect(boostData.boostFull).toBeGreaterThan(0);
      expect(boostData.boostZero).toBe(0.01); // ACCURACY constant in util.ts
    }
  });

  test('factory cannot be default supplier when fertility factor is 0', async ({ page }) => {
    const supplierData = await page.evaluate(() => {
      const island = (window as any).view.island();
      const factory = island.factories.find((f: any) => f.neededFertility) as any;
      if (!factory) return { skip: true };

      const product = factory.product;
      const islandFertility = island.getIslandFertility(factory.neededFertility.guid);
      
      islandFertility.checked(true);
      const canSupplyFull = factory.canSupply();

      islandFertility.checked(false);
      island.areaBuffs.filter((b: any) => b.addedFertility?.guid === factory.neededFertility.guid)
        .forEach((b: any) => b.scaling(0));
      
      const canSupplyZero = factory.canSupply();

      return { skip: false, canSupplyFull, canSupplyZero };
    });

    if (!supplierData.skip) {
      expect(supplierData.canSupplyFull).toBe(true);
      expect(supplierData.canSupplyZero).toBe(false);
    }
  });

  test('factory is still shown in product config even with 0 fertility', async ({ page }) => {
    const visibilityData = await page.evaluate(() => {
      const island = (window as any).view.island();
      const factory = island.factories.find((f: any) => f.neededFertility) as any;
      if (!factory) return { skip: true };

      const islandFertility = island.getIslandFertility(factory.neededFertility.guid);
      islandFertility.checked(false);
      island.areaBuffs.filter((b: any) => b.addedFertility?.guid === factory.neededFertility.guid)
        .forEach((b: any) => b.scaling(0));
      
      // Factory is not available for supply, but should still be in product.factories
      const inProductFactories = factory.product.factories.includes(factory);
      const inAvailableFactories = factory.product.availableFactories().includes(factory);

      return { skip: false, inProductFactories, inAvailableFactories };
    });

    if (!visibilityData.skip) {
      expect(visibilityData.inProductFactories).toBe(true);
      // availableFactories uses factory.available(), which doesn't check fertility.
      // Factory.canSupply() is used by Product.availableSuppliers().
      expect(visibilityData.inAvailableFactories).toBe(true);
    }
  });

  test('allFertilitiesSet reflects island fertility state', async ({ page }) => {
    const fertilitySetData = await page.evaluate(() => {
      const island = (window as any).view.island();
      if (island.isAllIslands()) return { skip: true };

      const fertilities = Array.from(island.islandFertilities.values()) as any[];
      fertilities.forEach(f => f.checked(true));
      const initialSet = island.allFertilitiesSet();

      fertilities[0].checked(false);
      const afterUncheckSet = island.allFertilitiesSet();

      return { skip: false, initialSet, afterUncheckSet };
    });

    if (!fertilitySetData.skip) {
      expect(fertilitySetData.initialSet).toBe(true);
      expect(fertilitySetData.afterUncheckSet).toBe(false);
    }
  });

  test('fertility checkbox is visible in factory config dialog', async ({ page }) => {
    // Open a product config dialog for a product that has a factory needing fertility
    const productGuid = await page.evaluate(() => {
      const island = (window as any).view.island();
      const factory = island.factories.find((f: any) => f.neededFertility);
      return factory ? factory.product.guid : null;
    });

    if (productGuid) {
      // Set the selected product and manually show the modal
      await page.evaluate((guid) => {
        const product = (window as any).view.island().assetsMap.get(guid);
        (window as any).view.selectedProduct(product);
        // Manually trigger Bootstrap modal because just setting the observable might not be enough in headless
        (window as any).$ && (window as any).$('#product-config-dialog').modal('show');
      }, productGuid);

      // Wait for modal to be visible and template to render
      // The id starts with fert-config- because we bound it like that in factory-config-section.html
      const checkbox = page.locator('input[type="checkbox"][id^="fert-config-"]');
      await expect(checkbox).toBeVisible({ timeout: 10000 });
      
      const label = page.locator('label[for^="fert-config-"]');
      await expect(label).toBeVisible();
      
      const text = await label.innerText();
      expect(text.length).toBeGreaterThan(0);
    }
  });
});
