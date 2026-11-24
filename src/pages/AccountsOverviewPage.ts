import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { NavigationMenu } from '../components/NavigationMenu';

/** Post-login account overview page. */
export class AccountsOverviewPage extends BasePage {
  readonly navigation: NavigationMenu;
  readonly welcome: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = new NavigationMenu(page);
    this.welcome = page.locator('#leftPanel p').filter({ hasText: 'Welcome' });
    this.heading = page
      .getByRole('heading')
      .filter({ hasText: /Accounts Overview|Welcome/ })
      .first();
  }

  /** Returns the displayed welcome text. */
  async getWelcomeMessage(): Promise<string> {
    return this.welcome.innerText();
  }

  /** Logs out and waits for the login panel. */
  async logout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Log Out', exact: true }).click();
  }

  /** Returns whether Accounts Overview loaded. */
  async isLoaded(): Promise<boolean> {
    return this.heading.isVisible();
  }
}
