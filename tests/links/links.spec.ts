import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import registrationData from '../../src/test-data/registrationData.json';
import type { RegistrationData } from '../../src/pages/RegistrationPage';
import { saveCredentials, loadCredentials } from '../../src/utils/credentialStore';
import { generateUsername } from '../../src/utils/dataGenerator';

interface LinkCase {
  name: string;
  href: string;
  external: boolean;
  group: 'pre-login' | 'post-login';
}

async function ensureRegisteredCredential(page: import('@playwright/test').Page): Promise<void> {
  if (fs.existsSync('test-data/generated/registeredUser.json')) return;
  const password = process.env.PARABANK_PASSWORD;
  if (!password) throw new Error('PARABANK_PASSWORD is missing. Copy .env.example to .env.');
  const baseURL = process.env.PARABANK_BASE_URL ?? 'https://parabank.parasoft.com/parabank';
  await page.goto(`${baseURL}/index.htm`);
  await page.getByRole('link', { name: 'Register', exact: true }).click();
  const data = registrationData as RegistrationData;
  const username = generateUsername();
  await page.locator('#customer\\.firstName').fill(data.firstName);
  await page.locator('#customer\\.lastName').fill(data.lastName);
  await page.locator('#customer\\.address\\.street').fill(data.address);
  await page.locator('#customer\\.address\\.city').fill(data.city);
  await page.locator('#customer\\.address\\.state').fill(data.state);
  await page.locator('#customer\\.address\\.zipCode').fill(data.zipCode);
  await page.locator('#customer\\.phoneNumber').fill(data.phone);
  await page.locator('#customer\\.ssn').fill(data.ssn);
  await page.locator('#customer\\.username').fill(username);
  await page.locator('#customer\\.password').fill(password);
  await page.locator('#repeatedPassword').fill(password);
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await expect(page.locator('#rightPanel')).toContainText('Your account was created successfully');
  saveCredentials({ username, password });
}

async function collectLinks(page: import('@playwright/test').Page, group: LinkCase['group']): Promise<LinkCase[]> {
  const baseURL = process.env.PARABANK_BASE_URL ?? 'https://parabank.parasoft.com/parabank';
  const raw = await page.locator('a').evaluateAll((links) =>
    links.map((link) => {
      const anchor = link as HTMLAnchorElement;
      return {
        name: (anchor.innerText || anchor.getAttribute('title') || anchor.href).trim(),
        href: anchor.href,
      };
    }),
  );
  const unique = new Map<string, LinkCase>();
  for (const link of raw) {
    if (!link.name || !link.href) continue;
    if (link.href.startsWith('javascript:') || link.href.startsWith('mailto:')) continue;
    const external = !link.href.startsWith(new URL(baseURL).origin);
    const key = `${link.name}|${link.href}`;
    unique.set(key, { ...link, external, group });
  }
  return [...unique.values()];
}

const preLoginLinks: LinkCase[] = [
  { name: 'About Us', href: 'about.htm', external: false, group: 'pre-login' },
  { name: 'Services', href: 'services.htm', external: false, group: 'pre-login' },
  { name: 'Products', href: 'http://www.parasoft.com/jsp/products.jsp', external: true, group: 'pre-login' },
  { name: 'Locations', href: 'http://www.parasoft.com/jsp/pr/contacts.jsp', external: true, group: 'pre-login' },
  { name: 'Admin Page', href: 'admin.htm', external: false, group: 'pre-login' },
  { name: 'home', href: 'index.htm', external: false, group: 'pre-login' },
  { name: 'about', href: 'about.htm', external: false, group: 'pre-login' },
  { name: 'contact', href: 'contact.htm', external: false, group: 'pre-login' },
  { name: 'Forgot login info?', href: 'lookup.htm', external: false, group: 'pre-login' },
  { name: 'Register', href: 'register.htm', external: false, group: 'pre-login' },
  { name: 'Withdraw Funds', href: 'services/ParaBank', external: false, group: 'pre-login' },
  { name: 'Transfer Funds', href: 'services/ParaBank', external: false, group: 'pre-login' },
  { name: 'Check Balances', href: 'services/ParaBank', external: false, group: 'pre-login' },
  { name: 'Make Deposits', href: 'services/ParaBank', external: false, group: 'pre-login' },
  { name: 'Bill Pay', href: 'services/bank', external: false, group: 'pre-login' },
  { name: 'Account History', href: 'services/bank', external: false, group: 'pre-login' },
  { name: 'Read More', href: 'services.htm', external: false, group: 'pre-login' },
  { name: 'ParaBank Is Now Re-Opened', href: 'news.htm#6', external: false, group: 'pre-login' },
  { name: 'New! Online Bill Pay', href: 'news.htm#5', external: false, group: 'pre-login' },
  { name: 'New! Online Account Transfers', href: 'news.htm#4', external: false, group: 'pre-login' },
  { name: 'Home', href: 'index.htm', external: false, group: 'pre-login' },
  { name: 'Site Map', href: 'sitemap.htm', external: false, group: 'pre-login' },
  { name: 'Contact Us', href: 'contact.htm', external: false, group: 'pre-login' },
  { name: 'www.parasoft.com', href: 'http://www.parasoft.com/', external: true, group: 'pre-login' },
];

let postLoginLinks: LinkCase[] = [
  { name: 'Open New Account', href: 'openaccount.htm', external: false, group: 'post-login' },
  { name: 'Accounts Overview', href: 'overview.htm', external: false, group: 'post-login' },
  { name: 'Transfer Funds', href: 'transfer.htm', external: false, group: 'post-login' },
  { name: 'Bill Pay', href: 'billpay.htm', external: false, group: 'post-login' },
  { name: 'Find Transactions', href: 'findtrans.htm', external: false, group: 'post-login' },
  { name: 'Update Contact Info', href: 'updateprofile.htm', external: false, group: 'post-login' },
  { name: 'Request Loan', href: 'requestloan.htm', external: false, group: 'post-login' },
  { name: 'Log Out', href: 'logout.htm', external: false, group: 'post-login' },
];

test.beforeAll(async ({ browser, request }) => {
  const baseURL = process.env.PARABANK_BASE_URL ?? 'https://parabank.parasoft.com/parabank';
  const page = await browser.newPage();
  await page.goto(`${baseURL}/index.htm`);

  await ensureRegisteredCredential(page);
  const credentials = loadCredentials();
  await page.goto(`${baseURL}/index.htm`);
  await page.locator('input[name="username"]').fill(credentials.username);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();
  postLoginLinks = await collectLinks(page, 'post-login');
  await page.close();
  expect(request).toBeTruthy();
});

for (const link of preLoginLinks) {
  test.describe(`pre-login links`, () => {
    test(link.name, async ({ page, request }) => {
      await test.step(`verify ${link.name}`, async () => {
        await page.goto(link.external ? 'https://parabank.parasoft.com/parabank/index.htm'
          : process.env.PARABANK_BASE_URL ?? 'https://parabank.parasoft.com/parabank');
        const anchor = page.getByRole('link', { name: link.name, exact: true }).first();
        await expect(anchor).toBeVisible();
        await expect(anchor).toBeEnabled();
        const href = await anchor.getAttribute('href');
        expect(href).toBeTruthy();

        if (link.external) {
          const response = await request.get(link.href, { maxRedirects: 5 });
          expect(response.status()).toBeLessThan(400);
        } else {
          const responsePromise = page.waitForResponse(
            (response) => response.url().includes(new URL(link.href).pathname),
            { timeout: 30_000 },
          ).catch(() => null);
          await anchor.click();
          const response = await responsePromise;
          if (response) expect(response.status()).toBeLessThan(400);
          await expect(page).not.toHaveURL(/javascript:/);
        }
      });
    });
  });
}

for (const link of postLoginLinks) {
  test.describe(`post-login links`, () => {
    test(link.name, async ({ page, request }) => {
      await test.step(`verify ${link.name}`, async () => {
        const credentials = JSON.parse(
          fs.readFileSync('test-data/generated/registeredUser.json', 'utf8'),
        ) as { username: string; password: string };
        const baseURL = process.env.PARABANK_BASE_URL ?? 'https://parabank.parasoft.com/parabank';
        await page.goto(`${baseURL}/index.htm`);
        await page.locator('input[name="username"]').fill(credentials.username);
        await page.locator('input[name="password"]').fill(credentials.password);
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

        const anchor = page.getByRole('link', { name: link.name, exact: true }).first();
        await expect(anchor).toBeVisible();
        await expect(anchor).toBeEnabled();
        expect(await anchor.getAttribute('href')).toBeTruthy();
        if (link.external) {
          const response = await request.get(link.href, { maxRedirects: 5 });
          expect(response.status()).toBeLessThan(400);
        } else {
          await anchor.click();
          await expect(page).not.toHaveURL(/javascript:/);
        }
      });
    });
  });
}
