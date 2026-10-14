import { expect, test } from '@fixtures';
import { messages } from '@data/messages';
import { users, type User } from '@data/users';

// Login is the feature under test, so these tests start without the shared session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    'standard user logs in and lands on the products page',
    { tag: '@smoke' },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.login(users.standard);

      await inventoryPage.expectToBeOpen();
      await expect(inventoryPage.title).toHaveText('Products');
    },
  );

  test('locked out user is rejected with an explanation', async ({ loginPage }) => {
    await loginPage.login(users.lockedOut);

    await expect(loginPage.errorMessage).toHaveText(messages.login.lockedOut);
    await loginPage.expectToBeOpen();
  });

  const invalidLogins: { scenario: string; user: User; error: string }[] = [
    {
      scenario: 'a wrong password',
      user: { username: users.standard.username, password: 'wrong_password' },
      error: messages.login.invalidCredentials,
    },
    {
      scenario: 'an unknown username',
      user: { username: 'unknown_user', password: users.standard.password },
      error: messages.login.invalidCredentials,
    },
    {
      scenario: 'an empty username',
      user: { username: '', password: users.standard.password },
      error: messages.login.usernameRequired,
    },
    {
      scenario: 'an empty password',
      user: { username: users.standard.username, password: '' },
      error: messages.login.passwordRequired,
    },
  ];

  for (const { scenario, user, error } of invalidLogins) {
    test(`shows a validation error for ${scenario}`, async ({ loginPage }) => {
      await loginPage.login(user);

      await expect(loginPage.errorMessage).toHaveText(error);
      await loginPage.expectToBeOpen();
    });
  }

  test('validation error can be dismissed', async ({ loginPage }) => {
    await loginPage.login({ username: '', password: '' });
    await expect(loginPage.errorMessage).toBeVisible();

    await loginPage.errorCloseButton.click();

    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('anonymous user cannot open a protected page', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await loginPage.expectToBeOpen();
    await expect(loginPage.errorMessage).toHaveText(
      messages.login.protectedPage('/inventory.html'),
    );
  });
});
