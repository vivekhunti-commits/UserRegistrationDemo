import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';

type PageFixtures = {
  homePage: HomePage;
  registrationPage: RegistrationPage;
  accountsOverviewPage: AccountsOverviewPage;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    const home = new HomePage(page);
    await home.open();
    await use(home);
  },
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
  accountsOverviewPage: async ({ page }, use) => {
    await use(new AccountsOverviewPage(page));
  },
});

export { expect } from '@playwright/test';
