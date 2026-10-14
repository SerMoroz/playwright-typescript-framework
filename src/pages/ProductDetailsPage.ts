import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailsPage extends BasePage {
  protected readonly path = '/inventory-item.html';

  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.removeButton = page.getByRole('button', { name: 'Remove' });
    this.backButton = page.getByTestId('back-to-products');
  }

  /**
   * The details URL carries a query string (`?id=4`), so only the path part is matched.
   * The app is a SPA that updates the URL before re-rendering, so the check also waits for
   * the details-only back button before tests query the product fields.
   */
  override async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL((url) => url.pathname === this.path);
    await expect(this.backButton).toBeVisible();
  }
}
