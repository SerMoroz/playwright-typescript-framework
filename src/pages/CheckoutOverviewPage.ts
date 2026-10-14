import type { Locator, Page } from '@playwright/test';
import { parsePrice } from '../utils/price';
import { BasePage } from './BasePage';

/** Checkout step two: order summary with totals. */
export class CheckoutOverviewPage extends BasePage {
  protected readonly path = '/checkout-step-two.html';

  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  async getItemPrices(): Promise<number[]> {
    const labels = await this.itemPrices.allTextContents();
    return labels.map(parsePrice);
  }

  async getTotals(): Promise<{ subtotal: number; tax: number; total: number }> {
    const [subtotal, tax, total] = await Promise.all([
      this.subtotalLabel.textContent(),
      this.taxLabel.textContent(),
      this.totalLabel.textContent(),
    ]);
    return {
      subtotal: parsePrice(subtotal ?? ''),
      tax: parsePrice(tax ?? ''),
      total: parsePrice(total ?? ''),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
