import type { Locator, Page } from '@playwright/test';

/** Shared top, left, account-service, and footer navigation. */
export class NavigationMenu {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Finds a navigation link by its accessible name. */
  link(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  /** Clicks a named navigation link. */
  async clickLink(name: string): Promise<void> {
    await this.link(name).click();
  }
}
