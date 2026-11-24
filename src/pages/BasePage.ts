import type { Page } from '@playwright/test';

/** Shared page behavior for all ParaBank POM classes. */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Opens a path relative to the configured base URL. */
  async goto(path = '/'): Promise<void> {
    const base = process.env.PARABANK_BASE_URL ?? 'https://parabank.parasoft.com/parabank';
    await this.page.goto(`${base}/${path.replace(/^\/+/, '')}`);
  }

  /** Returns whether a page is visibly loaded. */
  async isLoaded(): Promise<boolean> {
    return this.page.locator('#rightPanel').isVisible();
  }
}
