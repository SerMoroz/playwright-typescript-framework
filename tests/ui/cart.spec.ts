import { expect, test } from '@fixtures';
import { products } from '@data/products';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test(
    'contains every product added from the inventory',
    { tag: '@smoke' },
    async ({ inventoryPage, cartPage }) => {
      const selected = [products.backpack, products.onesie];
      for (const product of selected) {
        await inventoryPage.addToCart(product.name);
      }

      await inventoryPage.header.openCart();

      await cartPage.expectToBeOpen();
      await expect(cartPage.items).toHaveCount(selected.length);
      for (const product of selected) {
        await expect(cartPage.item(product.name)).toBeVisible();
      }
    },
  );

  test('removing a product updates the cart and the badge', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.boltTShirt.name);
    await inventoryPage.header.openCart();

    await cartPage.removeItem(products.backpack.name);

    await expect(cartPage.item(products.backpack.name)).toHaveCount(0);
    await expect(cartPage.items).toHaveCount(1);
    await cartPage.header.expectCartCount(1);
  });

  test('cart contents survive navigation and a page reload', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(products.bikeLight.name);
    await inventoryPage.header.openCart();
    await cartPage.continueShopping();
    await inventoryPage.expectToBeOpen();

    await page.reload();

    await inventoryPage.header.expectCartCount(1);
    await inventoryPage.header.openCart();
    await expect(cartPage.item(products.bikeLight.name)).toBeVisible();
  });
});
