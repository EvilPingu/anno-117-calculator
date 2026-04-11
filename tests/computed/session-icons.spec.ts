import { test, expect } from '@playwright/test';
import { ConfigLoader } from '../helpers/config-loader';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Session Icons on Factory Tiles', () => {
  let configLoader: ConfigLoader;

  test.beforeEach(async () => {
    configLoader = new ConfigLoader();
  });

  async function getBasicConfig() {
    const fullPath = path.resolve(process.cwd(), "tests/fixtures/basic.json");
    const configContent = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(configContent);
  }

  const checkProduct = async (page: any, productGuid: number, productName: string) => {
    const found = await page.evaluate((guid: number) => {
        const presenter = window.view.presenter;
        const p = presenter.categories
            .flatMap((cat: any) => cat.productPresenters)
            .find((p: any) => p.instance().guid === guid);
        
        if (p) {
            p.openConfigDialog();
            return true;
        }
        return false;
    }, productGuid);

    if (!found) {
        return false;
    }

    // Wait for dialog to be visible
    try {
        await page.waitForSelector('#product-config-dialog', { state: 'visible', timeout: 5000 });
    } catch (e) {
        // Continue anyway, maybe it's already there or selector differs
    }

    const info = await page.evaluate((guid: number) => {
        const presenter = window.view.presenter;
        const p = presenter.categories
            .flatMap((cat: any) => cat.productPresenters)
            .find((p: any) => p.instance().guid === guid);
        
        if (!p.factoryPresenters || p.factoryPresenters.length === 0) {
            return { hasIcon: false };
        }

        const dialog = document.querySelector('#product-config-dialog');
        if (!dialog) return { hasIcon: false };
        
        const producers = Array.from(dialog.querySelectorAll('.ui-fchain-item'));
        const superscript = producers[0]?.querySelector('.superscript-icon');
        const hasIcon = superscript !== null && superscript?.getAttribute('src') !== null;

        return {
            hasIcon: hasIcon
        };
    }, productGuid);

    // Close dialog reliably
    await page.evaluate(() => {
        const dialog = $('#product-config-dialog');
        dialog.modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    });
    
    await page.waitForTimeout(500);

    return info.hasIcon;
  };

  test('DLC active: Idols has session icon on factory tile in allIslands view', async ({ page }) => {
    const config = await getBasicConfig();
    config["calculatorSettings"] = JSON.stringify({ "settings.showAllProducts": "1" });
    
    await configLoader.loadConfigObject(page, config);
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');

    // Select All Islands
    await page.evaluate(() => {
        const allIslands = window.view.islands().find((i: any) => i.name === "All Islands");
        if (allIslands) { window.view.island(allIslands); }
    });

    // Activate all DLCs
    await page.evaluate(() => {
        window.view.dlcs.forEach((d: any) => d.checked(true));
    });

    const hasIcon = await checkProduct(page, 145220, "Idols");
    expect(hasIcon).toBe(true);
  });

  test('DLC inactive: session icons for marble are present', async ({ page }) => {
    const config = await getBasicConfig();
    config["calculatorSettings"] = JSON.stringify({ "settings.showAllProducts": "1" });
    
    await configLoader.loadConfigObject(page, config);
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');

    // Select All Islands
    await page.evaluate(() => {
        const allIslands = window.view.islands().find((i: any) => i.name === "All Islands");
        if (allIslands) { window.view.island(allIslands); }
    });

    // Deactivate all DLCs
    await page.evaluate(() => {
        window.view.dlcs.forEach((d: any) => d.checked(false));
    });

    // Marble (2179)
    const marbleHasIcon = await checkProduct(page, 2179, "Marble");
    expect(marbleHasIcon).toBe(true);
  });

  test('DLC active: Minerals has session icon', async ({ page }) => {
    const config = await getBasicConfig();
    config["calculatorSettings"] = JSON.stringify({ "settings.showAllProducts": "1" });
    
    await configLoader.loadConfigObject(page, config);
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');

    // Select All Islands
    await page.evaluate(() => {
        const allIslands = window.view.islands().find((i: any) => i.name === "All Islands");
        if (allIslands) { window.view.island(allIslands); }
    });

    // Activate all DLCs
    await page.evaluate(() => {
        window.view.dlcs.forEach((d: any) => d.checked(true));
    });

    // Minerals (8563)
    const mineralsHasIcon = await checkProduct(page, 8563, "Minerals");
    expect(mineralsHasIcon).toBe(true);
  });
});
