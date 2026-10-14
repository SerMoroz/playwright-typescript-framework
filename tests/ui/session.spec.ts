import { expect, test } from '@fixtures';
import { messages } from '@data/messages';
import { products } from '@data/products';

test.describe('Session and app menu', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test(
    'logout ends the session and protects the app',
    { tag: '@smoke' },
    async ({ page, inventoryPage, loginPage }) => {
      await inventoryPage.header.logout();

      await loginPage.expectToBeOpen();
      await expect(loginPage.loginButton).toBeVisible();

      await page.goto('/inventory.html');
      await expect(loginPage.errorMessage).toHaveText(
        messages.login.protectedPage('/inventory.html'),
      );
    },
  );

  test('reset app state empties the cart', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.redTShirt.name);
    await inventoryPage.header.expectCartCount(2);

    await inventoryPage.header.resetAppState();

    await inventoryPage.header.expectCartCount(0);
  });
});
