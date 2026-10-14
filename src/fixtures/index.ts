import { test as base } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';
import {
  CreateBookingResponseSchema,
  type CreateBookingResponse,
} from '../api/schemas/booking.schema';
import { buildBooking } from '../data/factories';
import {
  CartPage,
  CheckoutCompletePage,
  CheckoutInformationPage,
  CheckoutOverviewPage,
  InventoryPage,
  LoginPage,
  ProductDetailsPage,
} from '../pages';

interface PageFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
}

interface ApiFixtures {
  bookingClient: BookingClient;
  /** A fresh auth token for write operations. */
  authToken: string;
  /** A booking created before the test and deleted after it, keeping the shared API clean. */
  createdBooking: CreateBookingResponse;
}

/**
 * Project-wide `test` object. Specs import `test` and `expect` from here instead of
 * `@playwright/test`, and receive ready-to-use page objects and API clients as arguments.
 * Fixtures are lazy: a test only pays for what it destructures.
 */
export const test = base.extend<PageFixtures & ApiFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInformationPage: async ({ page }, use) => use(new CheckoutInformationPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),

  bookingClient: async ({ request }, use) => use(new BookingClient(request)),

  authToken: async ({ bookingClient }, use) => use(await bookingClient.getToken()),

  createdBooking: async ({ bookingClient, authToken }, use) => {
    const response = await bookingClient.createBooking(buildBooking());
    if (!response.ok()) {
      throw new Error(`Test data setup failed: ${response.status()} ${await response.text()}`);
    }
    const created = CreateBookingResponseSchema.parse(await response.json());

    await use(created);

    // Teardown runs even when the test fails. The booking may already be gone if the test deleted it.
    await bookingClient.deleteBooking(created.bookingid, authToken);
  },
});

export { expect } from '@playwright/test';
