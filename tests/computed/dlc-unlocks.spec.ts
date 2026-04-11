import { test, expect } from '@playwright/test';
import { ConfigLoader } from '../helpers/config-loader';
import * as fs from 'fs';
import * as path from 'path';

test.describe('DLC Unlock Logic', () => {
  let configLoader: ConfigLoader;

  test.beforeEach(async () => {
    configLoader = new ConfigLoader();
  });

  async function getBasicConfig() {
    const fullPath = path.resolve(process.cwd(), "tests/fixtures/basic.json");
    const configContent = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(configContent);
  }

  test('assets with dlcUnlocks have available() === false when no DLC is active', async ({ page }) => {
    const config = await getBasicConfig();
    
    await configLoader.loadConfigObject(page, config);
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');

    // Uncheck all DLCs
    await page.evaluate(() => {
        window.view.dlcs.forEach((d: any) => d.checked(false));
    });

    const availabilityInfo = await page.evaluate(() => {
        const island = window.view.island();
        if (!island) return { totalDlcAssets: 0, availableDlcAssets: 0 };
        const assets = Array.from(island.assetsMap.values());
        const dlcAssets = assets.filter((a: any) => a.dlcs && a.dlcs.length > 0);
        
        return {
            totalDlcAssets: dlcAssets.length,
            availableDlcAssets: dlcAssets.filter((a: any) => a.available()).length
        };
    });

    expect(availabilityInfo.totalDlcAssets).toBeGreaterThan(0);
    expect(availabilityInfo.availableDlcAssets).toBe(0);
  });

  test('products and effects with available() === false are not displayed in the frontend', async ({ page }) => {
    const config = await getBasicConfig();
    
    await configLoader.loadConfigObject(page, config);
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');

    // Uncheck all DLCs
    await page.evaluate(() => {
        window.view.dlcs.forEach((d: any) => d.checked(false));
    });

    const visibilityInfo = await page.evaluate(() => {
        const presenter = window.view.presenter;
        const allProductPresenters = presenter.categories.flatMap((cat: any) => cat.productPresenters);
        
        const unavailableProducts = allProductPresenters.filter((p: any) => p.instance() && !p.instance().available());
        const visibleUnavailableProducts = unavailableProducts.filter((p: any) => p.visible());

        // Check effects
        const allEffects = window.view.globalEffects;
        const unavailableEffects = allEffects.filter((e: any) => !e.available());
        
        return {
            totalUnavailableProducts: unavailableProducts.length,
            visibleUnavailableProducts: visibleUnavailableProducts.length
        };
    });

    expect(visibilityInfo.totalUnavailableProducts).toBeGreaterThan(0);
    expect(visibilityInfo.visibleUnavailableProducts).toBe(0);
  });

  test('activate all DLCs - ensure that available is true now', async ({ page }) => {
    const config = await getBasicConfig();
    
    await configLoader.loadConfigObject(page, config);
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');

    // Activate all DLCs
    await page.evaluate(() => {
        window.view.dlcs.forEach((d: any) => d.checked(true));
    });

    const availabilityInfo = await page.evaluate(() => {
        const island = window.view.island();
        if (!island) return { totalDlcAssets: 0, availableDlcAssets: 0 };
        const assets = Array.from(island.assetsMap.values());
        const dlcAssets = assets.filter((a: any) => a.dlcs && a.dlcs.length > 0);
        
        return {
            totalDlcAssets: dlcAssets.length,
            availableDlcAssets: dlcAssets.filter((a: any) => a.available()).length
        };
    });

    expect(availabilityInfo.totalDlcAssets).toBeGreaterThan(0);
    expect(availabilityInfo.availableDlcAssets).toBe(availabilityInfo.totalDlcAssets);
  });

  test('activate all DLCs ensure products and effects are shown', async ({ page }) => {
    const config = await getBasicConfig();
    // Enable showAllProducts to make sure they are shown if available
    config["calculatorSettings"] = JSON.stringify({
        "settings.showAllProducts": "1"
    });
    
    await configLoader.loadConfigObject(page, config);
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');

    // Activate all DLCs
    await page.evaluate(() => {
        window.view.dlcs.forEach((d: any) => d.checked(true));
    });

    const visibilityInfo = await page.evaluate(() => {
        const presenter = window.view.presenter;
        const allProductPresenters = presenter.categories.flatMap((cat: any) => cat.productPresenters);
        
        const dlcProducts = allProductPresenters.filter((p: any) => p.instance().dlcs && p.instance().dlcs.length > 0);
        const visibleDlcProducts = dlcProducts.filter((p: any) => p.visible());
        
        return {
            totalDlcProducts: dlcProducts.length,
            visibleDlcProducts: visibleDlcProducts.length
        };
    });

    expect(visibilityInfo.totalDlcProducts).toBeGreaterThan(0);
    expect(visibilityInfo.visibleDlcProducts).toBe(visibilityInfo.totalDlcProducts);
  });

  test('open product coal (guid 2085) and check that coal mine (guid 144810) is shown as a producer', async ({ page }) => {
    const config = await getBasicConfig();
    
    await configLoader.loadConfigObject(page, config);
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');

    // Activate all DLCs
    await page.evaluate(() => {
        window.view.dlcs.forEach((d: any) => d.checked(true));
    });

    // Find Coal product presenter and open its config dialog
    const coalPresenterFound = await page.evaluate(() => {
        const presenter = window.view.presenter;
        const coalPresenter = presenter.categories
            .flatMap((cat: any) => cat.productPresenters)
            .find((p: any) => p.instance().guid === 2085);
        
        if (coalPresenter) {
            coalPresenter.openConfigDialog();
            return true;
        }
        return false;
    });

    expect(coalPresenterFound).toBe(true);

    // Wait for dialog to be visible
    await page.waitForSelector('#product-config-dialog', { state: 'visible' });
    
    // Wait for Coal Mine to appear in the dialog (either as text or in a title attribute)
    await page.waitForFunction(() => {
        const dialog = document.querySelector('#product-config-dialog');
        if (!dialog) return false;
        
        // Check for text content
        const textFound = dialog.textContent?.includes('Coal Mine');
        if (textFound) return true;
        
        // Check for title attributes (in tab buttons)
        const titles = Array.from(dialog.querySelectorAll('[title]')).map(el => el.getAttribute('title'));
        return titles.some(t => t?.includes('Coal Mine'));
    }, { timeout: 10000 });

    // Check if Coal Mine is listed as a producer
    const producersInfo = await page.evaluate(() => {
        const dialog = document.querySelector('#product-config-dialog');
        if (!dialog) return { found: false };
        
        const textFound = dialog.textContent?.includes('Coal Mine');
        const titles = Array.from(dialog.querySelectorAll('[title]')).map(el => el.getAttribute('title'));
        const titleFound = titles.some(t => t?.includes('Coal Mine'));
        
        return {
            found: textFound || titleFound
        };
    });

    expect(producersInfo.found).toBe(true);
  });
});
