import { expect, test } from '@fixtures';
import { buildCustomer, type Customer } from '@data/factories';
import { messages } from '@data/messages';
import { products, TAX_RATE } from '@data/products';
import { sumPrices } from '@utils/price';

test.describe('Checkout', () => {
  test(
    'customer completes a purchase with correct totals',
    { tag: '@smoke' },
    async ({
      inventoryPage,
      cartPage,
      checkoutInformationPage,
      checkoutOverviewPage,
      checkoutCompletePage,
    }) => {
      const order = [products.backpack, products.bikeLight];

      await test.step('add products to the cart', async () => {
        await inventoryPage.goto();
        for (const product of order) {
          await inventoryPage.addToCart(product.name);
        }
        await inventoryPage.header.openCart();
        await cartPage.checkout();
      });

      await test.step('enter customer information', async () => {
        await checkoutInformationPage.expectToBeOpen();
        await checkoutInformationPage.fillCustomer(buildCustomer());
        await checkoutInformationPage.continue();
      });

      await test.step('review the order summary and totals', async () => {
        await checkoutOverviewPage.expectToBeOpen();
        await expect(checkoutOverviewPage.itemNames).toHaveCount(order.length);

        const expectedSubtotal = sumPrices(order.map((product) => product.price));
        const { subtotal, tax, total } = await checkoutOverviewPage.getTotals();

        expect(subtotal).toBe(expectedSubtotal);
        expect(tax).toBeCloseTo(expectedSubtotal * TAX_RATE, 2);
        expect(total).toBe(sumPrices([subtotal, tax]));
      });

      await test.step('place the order', async () => {
        await checkoutOverviewPage.finish();

        await checkoutCompletePage.expectToBeOpen();
        await expect(checkoutCompletePage.completeHeader).toHaveText(
          messages.checkout.orderComplete,
        );
        await checkoutCompletePage.header.expectCartCount(0);
      });

      await test.step('return to the products page', async () => {
        await checkoutCompletePage.backHomeButton.click();
        await inventoryPage.expectToBeOpen();
      });
    },
  );

  test.describe('customer information', () => {
    test.beforeEach(async ({ inventoryPage, cartPage }) => {
      await inventoryPage.goto();
      await inventoryPage.addToCart(products.onesie.name);
      await inventoryPage.header.openCart();
      await cartPage.checkout();
    });

    const requiredFields: { field: keyof Customer; error: string }[] = [
      { field: 'firstName', error: messages.checkout.firstNameRequired },
      { field: 'lastName', error: messages.checkout.lastNameRequired },
      { field: 'postalCode', error: messages.checkout.postalCodeRequired },
    ];

    for (const { field, error } of requiredFields) {
      test(`requires ${field}`, async ({ checkoutInformationPage }) => {
        await checkoutInformationPage.fillCustomer(buildCustomer({ [field]: '' }));
        await checkoutInformationPage.continue();

        await expect(checkoutInformationPage.errorMessage).toHaveText(error);
        await checkoutInformationPage.expectToBeOpen();
      });
    }

    test('cancelling returns to the cart with the items kept', async ({
      checkoutInformationPage,
      cartPage,
    }) => {
      await checkoutInformationPage.cancel();

      await cartPage.expectToBeOpen();
      await expect(cartPage.item(products.onesie.name)).toBeVisible();
    });
  });
});
