# Test Plan

## 1. Scope

| Application                                                              | Layer    | In scope                                                                                              | Out of scope                                                         |
| ------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Sauce Demo](https://www.saucedemo.com)                                  | Web UI   | Authentication, product catalogue, sorting, product details, cart, checkout, logout, app reset        | Visual regression, performance, accessibility audits, external links |
| [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | REST API | Health check, token auth, booking create/read/search/update/delete, authorisation, not-found handling | Load testing, security testing beyond authorisation checks           |

## 2. Approach

- **Risk-based prioritisation.** The purchase flow (login, cart, checkout) carries the business value and
  is tagged `@smoke`. Validation, sorting and edge cases form the regression suite.
- **UI tests** verify user journeys through the browser on Chromium, Firefox, WebKit and a mobile
  viewport (Pixel 7).
- **API tests** verify status codes, response contracts (Zod schemas) and persisted state. Write
  operations are re-read with a GET, so a test proves the change was stored, not only echoed.
- **Test data** is generated per test with Faker. API data is created by fixtures and deleted on teardown.
- **Oracles** are independent of the UI under test: product names and prices come from
  `src/data/products.ts`, and totals are recomputed in the test.

## 3. Environments

| Item       | Value                                                                     |
| ---------- | ------------------------------------------------------------------------- |
| Browsers   | Chromium, Firefox, WebKit (desktop) and Chromium on Pixel 7 emulation     |
| Runner     | Playwright Test, fully parallel                                           |
| CI         | GitHub Actions on Ubuntu, on push, pull request, nightly and on demand    |
| Test users | `standard_user`, `locked_out_user` (Sauce Demo); `admin` (Restful Booker) |

## 4. UI scenarios (Sauce Demo)

Each scenario runs on all four browser projects.

| ID    | Area      | Scenario                                                            | Tag    | Spec                |
| ----- | --------- | ------------------------------------------------------------------- | ------ | ------------------- |
| UI-01 | Login     | Standard user logs in and lands on the products page                | @smoke | `login.spec.ts`     |
| UI-02 | Login     | Locked out user is rejected with an explanation                     |        | `login.spec.ts`     |
| UI-03 | Login     | Validation error for a wrong password                               |        | `login.spec.ts`     |
| UI-04 | Login     | Validation error for an unknown username                            |        | `login.spec.ts`     |
| UI-05 | Login     | Validation error for an empty username                              |        | `login.spec.ts`     |
| UI-06 | Login     | Validation error for an empty password                              |        | `login.spec.ts`     |
| UI-07 | Login     | Validation error can be dismissed                                   |        | `login.spec.ts`     |
| UI-08 | Login     | Anonymous user cannot open a protected page                         |        | `login.spec.ts`     |
| UI-09 | Inventory | Lists the full catalogue with correct prices                        | @smoke | `inventory.spec.ts` |
| UI-10 | Inventory | Sorts products by name (A to Z)                                     |        | `inventory.spec.ts` |
| UI-11 | Inventory | Sorts products by name (Z to A)                                     |        | `inventory.spec.ts` |
| UI-12 | Inventory | Sorts products by price (low to high)                               |        | `inventory.spec.ts` |
| UI-13 | Inventory | Sorts products by price (high to low)                               |        | `inventory.spec.ts` |
| UI-14 | Inventory | Adding and removing products keeps the cart badge in sync           |        | `inventory.spec.ts` |
| UI-15 | Inventory | Product details match the listing and can be added to the cart      |        | `inventory.spec.ts` |
| UI-16 | Cart      | Contains every product added from the inventory                     | @smoke | `cart.spec.ts`      |
| UI-17 | Cart      | Removing a product updates the cart and the badge                   |        | `cart.spec.ts`      |
| UI-18 | Cart      | Cart contents survive navigation and a page reload                  |        | `cart.spec.ts`      |
| UI-19 | Checkout  | Customer completes a purchase with correct subtotal, tax and total  | @smoke | `checkout.spec.ts`  |
| UI-20 | Checkout  | First name is required                                              |        | `checkout.spec.ts`  |
| UI-21 | Checkout  | Last name is required                                               |        | `checkout.spec.ts`  |
| UI-22 | Checkout  | Postal code is required                                             |        | `checkout.spec.ts`  |
| UI-23 | Checkout  | Cancelling customer information returns to the cart with items kept |        | `checkout.spec.ts`  |
| UI-24 | Session   | Logout ends the session and protects the app                        | @smoke | `session.spec.ts`   |
| UI-25 | Session   | Reset app state empties the cart                                    |        | `session.spec.ts`   |

## 5. API scenarios (Restful Booker)

| ID     | Area    | Scenario                                                   | Expected          | Tag    | Spec              |
| ------ | ------- | ---------------------------------------------------------- | ----------------- | ------ | ----------------- |
| API-01 | Health  | Health check reports the service is up                     | `201`             | @smoke | `auth.spec.ts`    |
| API-02 | Auth    | Valid credentials return a token                           | `200` + token     | @smoke | `auth.spec.ts`    |
| API-03 | Auth    | Invalid credentials do not return a token                  | `200` + reason    |        | `auth.spec.ts`    |
| API-04 | Booking | Creates a booking and echoes it back with an id            | `200` + contract  | @smoke | `booking.spec.ts` |
| API-05 | Booking | Retrieves a booking by id                                  | `200` + contract  |        | `booking.spec.ts` |
| API-06 | Booking | Finds a booking by guest name                              | `200` + id listed |        | `booking.spec.ts` |
| API-07 | Booking | Replaces a booking with PUT, and the change is persisted   | `200`             |        | `booking.spec.ts` |
| API-08 | Booking | Updates selected fields with PATCH and keeps the rest      | `200`             |        | `booking.spec.ts` |
| API-09 | Booking | Rejects an update without a token, booking unchanged       | `403`             |        | `booking.spec.ts` |
| API-10 | Booking | Rejects an update with an invalid token, booking unchanged | `403`             |        | `booking.spec.ts` |
| API-11 | Booking | Deletes a booking, after which it is not found             | `201`, then `404` |        | `booking.spec.ts` |
| API-12 | Booking | Returns not found for a booking that does not exist        | `404`             |        | `booking.spec.ts` |

### Known API behaviour

Restful Booker is a deliberately imperfect practice API. The tests assert its real behaviour and
document it, rather than hiding it:

- `GET /ping` and a successful `DELETE /booking/{id}` return `201 Created` instead of `200`/`204`.
- `POST /auth` with wrong credentials returns `200 OK` with `{"reason":"Bad credentials"}` instead of `401`.

In a real project each of these would be raised as a defect or confirmed as intended in the API
specification.

## 6. Entry and exit criteria

- **Entry:** typecheck, lint and format checks pass (enforced by the CI `static-checks` job).
- **Exit:** all `@smoke` tests pass on every browser project. Any regression failure has a linked trace
  and is either fixed or logged as a defect before release.

## 7. Possible extensions

- Visual regression with `toHaveScreenshot()` for the inventory and checkout pages.
- Accessibility checks with `@axe-core/playwright`.
- Coverage of the remaining demo users (`problem_user`, `performance_glitch_user`, `error_user`) as
  known-defect and performance scenarios.
- Publishing the HTML report to GitHub Pages.
