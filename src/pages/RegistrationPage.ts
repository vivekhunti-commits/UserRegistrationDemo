import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AccountsOverviewPage } from './AccountsOverviewPage';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  ssn: string;
}

/** Registration form page. */
export class RegistrationPage extends BasePage {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Signing up is easy!' });
  }

  /** Registers a customer and returns the resulting overview page. */
  async registerUser(
    data: RegistrationData,
    username: string,
    password: string,
  ): Promise<AccountsOverviewPage> {
    await this.page.locator('#customer\\.firstName').fill(data.firstName);
    await this.page.locator('#customer\\.lastName').fill(data.lastName);
    await this.page.locator('#customer\\.address\\.street').fill(data.address);
    await this.page.locator('#customer\\.address\\.city').fill(data.city);
    await this.page.locator('#customer\\.address\\.state').fill(data.state);
    await this.page.locator('#customer\\.address\\.zipCode').fill(data.zipCode);
    await this.page.locator('#customer\\.phoneNumber').fill(data.phone);
    await this.page.locator('#customer\\.ssn').fill(data.ssn);
    await this.page.locator('#customer\\.username').fill(username);
    await this.page.locator('#customer\\.password').fill(password);
    await this.page.locator('#repeatedPassword').fill(password);
    await this.page.getByRole('button', { name: 'Register', exact: true }).click();
    return new AccountsOverviewPage(this.page);
  }

  /** Submits the form as-is for validation checks. */
  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Register', exact: true }).click();
  }

  /** Returns the registration panel text. */
  async getValidationText(): Promise<string> {
    return this.page.locator('#rightPanel').innerText();
  }

  /** Returns whether the registration page loaded. */
  async isLoaded(): Promise<boolean> {
    return this.heading.isVisible();
  }
}
