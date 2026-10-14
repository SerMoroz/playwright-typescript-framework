import { expect, test } from '@fixtures';
import { allProducts, products, SortOption } from '@data/products';

const formatPrice = (price: number): string => `$${price.toFixed(2)}`;
const names = allProducts.map((product) => product.name);
const prices = allProducts.map((product) => product.price);

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test(
    'lists the full catalogue with correct prices',
    { tag: '@smoke' },
    async ({ inventoryPage }) => {
      await expect(inventoryPage.items).toHaveCount(allProducts.length);

      for (const product of allProducts) {
        await expect(
          inventoryPage.item(product.name).getByTestId('inventory-item-price'),
        ).toHaveText(formatPrice(product.price));
      }
    },
  );

  const sortCases = [
    {
      option: SortOption.NameAsc,
      label: 'name (A to Z)',
      expectedNames: [...names].sort((a, b) => a.localeCompare(b)),
    },
    {
      option: SortOption.NameDesc,
      label: 'name (Z to A)',
      expectedNames: [...names].sort((a, b) => b.localeCompare(a)),
    },
  ];

  for (const { option, label, expectedNames } of sortCases) {
    test(`sorts products by ${label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);

      await expect(inventoryPage.itemNames).toHaveText(expectedNames);
    });
  }

  // Two products share a price, so price sorting is verified on prices rather than on names.
  const priceSortCases = [
    {
      option: SortOption.PriceAsc,
      label: 'price (low to high)',
      expectedPrices: [...prices].sort((a, b) => a - b),
    },
    {
      option: SortOption.PriceDesc,
      label: 'price (high to low)',
      expectedPrices: [...prices].sort((a, b) => b - a),
    },
  ];

  for (const { option, label, expectedPrices } of priceSortCases) {
    test(`sorts products by ${label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);

      await expect(inventoryPage.itemPrices).toHaveText(expectedPrices.map(formatPrice));
    });
  }

  test('adding and removing products keeps the cart badge in sync', async ({ inventoryPage }) => {
    await inventoryPage.header.expectCartCount(0);

    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.bikeLight.name);
    await inventoryPage.header.expectCartCount(2);
    await expect(
      inventoryPage.item(products.backpack.name).getByRole('button', { name: 'Remove' }),
    ).toBeVisible();

    await inventoryPage.removeFromCart(products.backpack.name);
    await inventoryPage.header.expectCartCount(1);
    await expect(
      inventoryPage.item(products.backpack.name).getByRole('button', { name: 'Add to cart' }),
    ).toBeVisible();
  });

  test('product details match the listing and can be added to the cart', async ({
    inventoryPage,
    productDetailsPage,
  }) => {
    const { name, price } = products.fleeceJacket;

    await inventoryPage.openProduct(name);

    await productDetailsPage.expectToBeOpen();
    await expect(productDetailsPage.name).toHaveText(name);
    await expect(productDetailsPage.price).toHaveText(formatPrice(price));
    await expect(productDetailsPage.description).not.toBeEmpty();

    await productDetailsPage.addToCartButton.click();
    await productDetailsPage.header.expectCartCount(1);
    await expect(productDetailsPage.removeButton).toBeVisible();

    await productDetailsPage.backButton.click();
    await inventoryPage.expectToBeOpen();
  });
});
