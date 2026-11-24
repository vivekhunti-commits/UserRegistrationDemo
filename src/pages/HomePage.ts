import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { RegistrationPage } from './RegistrationPage';
import { AccountsOverviewPage } from './AccountsOverviewPage';
import { NavigationMenu } from '../components/NavigationMenu';

/** Pre-login home page and login panel. */
export class HomePage extends BasePage {
  readonly navigation: NavigationMenu;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = new NavigationMenu(page);
    this.username = page.locator('input[name="username"]');
    this.password = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
  }

  /** Opens the ParaBank home page. */
  async open(): Promise<this> {
    await this.goto('index.htm');
    return this;
  }

  /** Opens the registration form. */
  async openRegistration(): Promise<RegistrationPage> {
    await this.page.getByRole('link', { name: 'Register', exact: true }).click();
    return new RegistrationPage(this.page);
  }

  /** Logs in and returns Accounts Overview. */
  async login(username: string, password: string): Promise<AccountsOverviewPage> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
    return new AccountsOverviewPage(this.page);
  }

  /** Returns whether the login panel is visible. */
  async isLoginPanelVisible(): Promise<boolean> {
    return this.page.getByRole('heading', { name: 'Customer Login' }).isVisible();
  }
}
