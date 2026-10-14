# Playwright + TypeScript Test Automation Framework

[![Playwright Tests](https://github.com/SerMoroz/playwright-typescript-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/SerMoroz/playwright-typescript-framework/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

An end-to-end test automation framework for **web UI and REST API** testing, built from scratch with
[Playwright](https://playwright.dev) and TypeScript. It shows how I structure a maintainable test suite:
Page Object Model, custom fixtures, typed test data, API contract validation, cross-browser and mobile
runs, static quality gates and a CI pipeline.

| System under test                                                        | Type        | What is covered                                                     |
| ------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------- |
| [Sauce Demo](https://www.saucedemo.com)                                  | Web shop UI | Login, product catalogue, sorting, cart, checkout, session handling |
| [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | REST API    | Auth, booking CRUD, search, authorisation, error handling           |

**113 tests in total:** 25 UI scenarios × 4 browser projects, 12 API tests and 1 login setup step.
The detailed scenario list is in [docs/TEST_PLAN.md](docs/TEST_PLAN.md).

---

## Contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Key design decisions](#key-design-decisions)
- [Getting started](#getting-started)
- [Running tests](#running-tests)
- [Reports and debugging](#reports-and-debugging)
- [Continuous integration](#continuous-integration)
- [Writing a new test](#writing-a-new-test)
- [Conventions](#conventions)
- [Author](#author)

## Tech stack

| Tool                                                                                                                        | Purpose                                                              |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Playwright Test](https://playwright.dev/docs/intro)                                                                        | Test runner, browser automation and API client                       |
| [TypeScript](https://www.typescriptlang.org) (strict)                                                                       | Type safety across page objects, data and API contracts              |
| [Zod](https://zod.dev)                                                                                                      | Runtime validation of API responses and environment config           |
| [Faker](https://fakerjs.dev)                                                                                                | Unique, realistic test data for every run                            |
| [ESLint](https://eslint.org) + [eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright) | Catches missing `await`s, focused tests and tests without assertions |
| [Prettier](https://prettier.io)                                                                                             | Consistent formatting                                                |
| [GitHub Actions](https://docs.github.com/actions)                                                                           | CI: quality gates, parallel browser jobs, nightly regression         |

## Project structure

```
.
├── .github/workflows/
│   └── playwright.yml          # CI pipeline
├── docs/
│   └── TEST_PLAN.md            # Scope, scenarios and coverage matrix
├── src/
│   ├── api/
│   │   ├── BookingClient.ts    # Typed client over the REST API
│   │   └── schemas/            # Zod contracts for API responses
│   ├── config/
│   │   ├── env.ts              # Validated environment configuration
│   │   └── paths.ts            # Shared file paths (saved session)
│   ├── data/
│   │   ├── factories.ts        # Test data builders (Faker)
│   │   ├── messages.ts         # Expected UI messages
│   │   ├── products.ts         # Product catalogue oracle, sort options, tax rate
│   │   └── users.ts            # Demo user accounts
│   ├── fixtures/
│   │   └── index.ts            # Custom `test` with page objects and API fixtures
│   ├── pages/
│   │   ├── components/
│   │   │   └── HeaderComponent.ts
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── ProductDetailsPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInformationPage.ts
│   │   ├── CheckoutOverviewPage.ts
│   │   └── CheckoutCompletePage.ts
│   └── utils/
│       └── price.ts            # Price parsing and float-safe arithmetic
├── tests/
│   ├── auth.setup.ts           # Logs in once, saves the session for UI tests
│   ├── api/
│   │   ├── auth.spec.ts
│   │   └── booking.spec.ts
│   └── ui/
│       ├── login.spec.ts
│       ├── inventory.spec.ts
│       ├── cart.spec.ts
│       ├── checkout.spec.ts
│       └── session.spec.ts
├── .env.example
├── eslint.config.mjs
├── playwright.config.ts
└── tsconfig.json
```

## Key design decisions

**Page Object Model with components.** Each page is a class that exposes locators and
intent-revealing actions (`login(user)`, `addToCart(name)`). Business assertions stay in the specs, so
page objects are reusable and tests read as specifications. Shared UI (header, burger menu, cart badge)
is a `HeaderComponent` composed into every page through `BasePage`.

**Custom fixtures instead of manual setup.** `src/fixtures/index.ts` extends Playwright's `test` so specs
receive ready page objects and API clients as arguments. Fixtures are lazy, so a test only builds what it
uses. The `createdBooking` fixture creates API test data before a test and **deletes it afterwards, even
when the test fails**, which keeps the shared environment clean.

**Log in once, reuse the session.** The `setup` project logs in through the UI and saves the session to
`.auth/`. All UI projects depend on it and start authenticated, which saves a login per test. Tests that
exercise login itself opt out with an empty `storageState`.

**Resilient locators.** Locators use the application's `data-test` attributes (`getByTestId`) and
accessible roles (`getByRole`). Products are located by their visible name, never by position or
generated ids. All waits rely on Playwright's auto-waiting and web-first assertions; there are no
hard-coded sleeps.

**Typed, validated API contracts.** API responses are parsed with Zod schemas. A renamed field or a wrong
type fails with a precise message. The same schemas generate the TypeScript types used by the client and
data factories, so contract and code cannot drift apart.

**Independent, parallel tests.** Every test creates the state it needs, runs in its own browser context
and can run alone, in any order, in parallel (`fullyParallel: true`). Test data is generated with Faker,
so parallel runs never collide.

**Data-driven tests.** Validation scenarios (invalid logins, required checkout fields, sorting options,
unauthorised API calls) are tables of cases looped into individual tests, so adding a case is one line.

**Fail fast on configuration.** Environment variables are validated with Zod on start-up. A malformed
URL fails immediately with a clear message rather than deep inside a test.

**Static quality gates.** TypeScript runs in strict mode. ESLint uses type-aware rules such as
`no-floating-promises`, which catches a missing `await` (the most common cause of flaky Playwright
tests), plus the Playwright plugin, which blocks committed `test.only` and tests without assertions.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20.19 or newer (CI uses the version in `.nvmrc`)
- Git

### Installation

```bash
git clone https://github.com/SerMoroz/playwright-typescript-framework.git
```

```bash
cd playwright-typescript-framework
```

```bash
npm ci
```

```bash
npx playwright install --with-deps
```

### Configuration (optional)

The suite runs out of the box against the public demo environments. To point it elsewhere, copy
`.env.example` to `.env` and change the values:

| Variable         | Default                                | Description                           |
| ---------------- | -------------------------------------- | ------------------------------------- |
| `BASE_URL`       | `https://www.saucedemo.com`            | UI application under test             |
| `API_BASE_URL`   | `https://restful-booker.herokuapp.com` | API under test                        |
| `SAUCE_PASSWORD` | `secret_sauce`                         | Password shared by the demo UI users  |
| `API_USERNAME`   | `admin`                                | API user for token authentication     |
| `API_PASSWORD`   | `password123`                          | API password for token authentication |

All defaults are public demo credentials published by the applications themselves.

## Running tests

| Command                 | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `npm test`              | Full suite: all browsers, mobile and API                  |
| `npm run test:ui`       | UI suite on Chromium, Firefox, WebKit and mobile Chrome   |
| `npm run test:chromium` | UI suite on Chromium only (quickest feedback)             |
| `npm run test:api`      | API suite only (no browser needed)                        |
| `npm run test:smoke`    | Only tests tagged `@smoke`, on every project              |
| `npm run test:headed`   | Chromium with a visible browser window                    |
| `npm run test:debug`    | Step through a test with the Playwright Inspector         |
| `npm run test:ui-mode`  | Interactive Playwright UI mode with time-travel debugging |
| `npm run check`         | Typecheck, lint and format check                          |

Any Playwright CLI option can be passed after `--`, for example:

```bash
npm test -- tests/ui/checkout.spec.ts --project=webkit
```

```bash
npm run test:chromium -- --grep "sorts products"
```

## Reports and debugging

- **HTML report:** generated in `playwright-report/` after every run. Open it with `npm run report`.
- **On failure:** a screenshot and a video are attached to the failed test in the report.
- **Traces:** recorded on the first retry (CI retries twice). Open one with
  `npx playwright show-trace <path-to-trace.zip>` to inspect every action, network call and DOM snapshot.
- **JUnit XML:** written to `test-results/junit.xml` on CI, for test management tools and dashboards.

## Continuous integration

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on every push and pull
request to `main`, nightly on weekdays and on demand:

```
static-checks (typecheck, lint, format)
        │
        ├── api-tests
        └── ui-tests  ── chromium │ firefox │ webkit │ mobile-chrome   (parallel matrix)
```

- Static checks gate the test jobs, so broken code never reaches a browser.
- Each browser runs as a separate job in parallel, with `fail-fast: false` so one browser failing
  does not hide results from the others.
- On CI the runner retries a failed test twice, forbids `test.only`, and annotates failures inline in the
  pull request.
- HTML reports, traces, screenshots and videos are uploaded as build artifacts for 14 days.

## Writing a new test

1. **Page object.** Add locators and actions to the page under `src/pages/`, or create a new class that
   extends `BasePage` and export it from `src/pages/index.ts`.
2. **Fixture.** Register the page object in `src/fixtures/index.ts` so tests can request it.
3. **Spec.** Import `test` and `expect` from `@fixtures`:

```ts
import { expect, test } from '@fixtures';
import { products } from '@data/products';

test('adds a product to the cart', { tag: '@smoke' }, async ({ inventoryPage }) => {
  await inventoryPage.goto();

  await inventoryPage.addToCart(products.backpack.name);

  await inventoryPage.header.expectCartCount(1);
});
```

4. **Verify.** Run `npm run check` and the new test before committing.

## Conventions

- **Test names describe behaviour**, e.g. "locked out user is rejected with an explanation".
- **Arrange, act, assert**, separated by blank lines. Long flows are split with `test.step()` so the
  report reads as a sequence of business steps.
- **Tags:** `@smoke` marks the critical path, a fast subset for deployment checks. Untagged tests are
  the regression suite.
- **No hard-coded waits.** Use web-first assertions (`await expect(locator).toBeVisible()`).
- **Import aliases:** `@fixtures`, `@pages`, `@api/*`, `@config/*`, `@data/*` and `@utils/*`
  (configured in `tsconfig.json`) keep imports short and independent of folder depth.
- **API quirks are documented where they are asserted.** Restful Booker answers a health check and a
  successful DELETE with `201`, and a failed login with `200` and an error body. The tests assert the
  actual behaviour and say so in a comment, rather than hiding it.

## Author

**Serhii Moroz**, Senior QA Automation Engineer (SDET)

[LinkedIn](https://www.linkedin.com/in/serhii-m-bba759105/)

## License

[MIT](LICENSE)
