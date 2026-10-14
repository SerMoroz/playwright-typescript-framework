import { test as setup } from '@fixtures';
import { STORAGE_STATE } from '@config/paths';
import { users } from '@data/users';

/**
 * Logs in through the UI once and stores the session cookie.
 * UI projects depend on this and start every test already authenticated,
 * which keeps tests fast and focused on the feature they cover.
 */
setup('authenticate as standard user', async ({ page, loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login(users.standard);
  await inventoryPage.expectToBeOpen();

  await page.context().storageState({ path: STORAGE_STATE });
});
