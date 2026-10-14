import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

/**
 * Common behaviour for every page object.
 *
 * Page objects expose locators and intent-revealing actions only. Assertions about
 * business rules live in the specs, so a page object can be reused by any test.
 */
export abstract class BasePage {
  /** Path relative to `baseURL`, e.g. `/cart.html`. */
  protected abstract readonly path: string;

  readonly header: HeaderComponent;

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
  }

  /** Navigates directly to the page. */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Asserts that the browser is on this page, using the URL as the identity check. */
  async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${escapeRegExp(this.path)}$`));
  }

  /** Secondary header title, e.g. "Products" or "Your Cart". */
  get title(): Locator {
    return this.page.getByTestId('title');
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
