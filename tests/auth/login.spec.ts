import { test, expect } from '../../src/fixtures/pageFixtures';
import registrationData from '../../src/test-data/registrationData.json';
import type { RegistrationData } from '../../src/pages/RegistrationPage';
import { loadCredentials, saveCredentials } from '../../src/utils/credentialStore';
import { generateUsername } from '../../src/utils/dataGenerator';
import fs from 'node:fs';

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  if (fs.existsSync('test-data/generated/registeredUser.json')) return;
  const password = process.env.PARABANK_PASSWORD;
  if (!password) throw new Error('PARABANK_PASSWORD is missing. Copy .env.example to .env.');
  const page = await browser.newPage();
  await page.goto(process.env.PARABANK_BASE_URL ?? 'https://parabank.parasoft.com/parabank');
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
  await page.close();
});

test('logs in with the newly registered user and shows the welcome name', async ({ homePage }) => {
  const credentials = loadCredentials();
  const data = registrationData as RegistrationData;
  const overview = await homePage.login(credentials.username, credentials.password);
  await expect(overview.heading).toBeVisible();
  await expect(overview.welcome).toContainText(`Welcome ${data.firstName} ${data.lastName}`);
  await overview.logout();
  await expect(homePage.page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();
});

test('rejects an incorrect password', async ({ homePage }) => {
  await homePage.page.context().clearCookies();
  await homePage.open();
  await homePage.login(`missing_${Date.now()}`, 'WrongPassword987!');
  await expect(homePage.page.locator('#rightPanel')).toContainText(
    /username and password|internal error/i,
  );
});

test('rejects empty username and password', async ({ homePage }) => {
  await homePage.login('', '');
  await expect(homePage.page.locator('#rightPanel')).toContainText(
    'Please enter a username and password.',
  );
});
