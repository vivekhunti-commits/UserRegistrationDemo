import registrationData from '../../src/test-data/registrationData.json';
import type { RegistrationData } from '../../src/pages/RegistrationPage';
import { test, expect } from '../../src/fixtures/pageFixtures';
import { generateUsername } from '../../src/utils/dataGenerator';
import { saveCredentials, loadCredentials } from '../../src/utils/credentialStore';
import fs from 'node:fs';

const data = registrationData as RegistrationData;
const password = process.env.PARABANK_PASSWORD;

test.describe.configure({ mode: 'serial' });

test.beforeAll(() => {
  if (!password) throw new Error('PARABANK_PASSWORD is missing. Copy .env.example to .env.');
});

test('registers a brand-new user and persists credentials', async ({ homePage }) => {
  const username = generateUsername();
  const registration = await homePage.openRegistration();
  const overview = await registration.registerUser(data, username, password as string);
  await expect(overview.heading).toBeVisible();
  await expect(overview.page.locator('#rightPanel')).toContainText('Your account was created successfully');
  await expect(overview.welcome).toContainText(`Welcome ${data.firstName} ${data.lastName}`);
  saveCredentials({ username, password: password as string });
  await overview.logout();
  await expect(homePage.isLoginPanelVisible()).resolves.toBe(true);
});

test('shows mandatory-field validation for an empty registration', async ({ homePage }) => {
  const registration = await homePage.openRegistration();
  await registration.submit();
  const text = await registration.getValidationText();
  for (const message of [
    'First name is required.',
    'Last name is required.',
    'Address is required.',
    'City is required.',
    'State is required.',
    'Zip Code is required.',
    'Social Security Number is required.',
    'Username is required.',
    'Password is required.',
    'Password confirmation is required.',
  ]) {
    expect(text).toContain(message);
  }
});

test('rejects mismatched password and confirmation', async ({ homePage }) => {
  const registration = await homePage.openRegistration();
  await registration.page.locator('#customer\\.firstName').fill(data.firstName);
  await registration.page.locator('#customer\\.lastName').fill(data.lastName);
  await registration.page.locator('#customer\\.address\\.street').fill(data.address);
  await registration.page.locator('#customer\\.address\\.city').fill(data.city);
  await registration.page.locator('#customer\\.address\\.state').fill(data.state);
  await registration.page.locator('#customer\\.address\\.zipCode').fill(data.zipCode);
  await registration.page.locator('#customer\\.ssn').fill(data.ssn);
  await registration.page.locator('#customer\\.username').fill(generateUsername());
  await registration.page.locator('#customer\\.password').fill(password as string);
  await registration.page.locator('#repeatedPassword').fill(`${password}different`);
  await registration.submit();
  await expect(registration.page.locator('#rightPanel')).toContainText('Passwords did not match.');
});

test('rejects an already-used username', async ({ homePage }) => {
  const generatedPath = 'test-data/generated/registeredUser.json';
  if (!fs.existsSync(generatedPath)) {
    throw new Error('Positive registration must run before the duplicate-username check.');
  }
  const credentials = loadCredentials();
  const registration = await homePage.openRegistration();
  await registration.page.locator('#customer\\.firstName').fill(data.firstName);
  await registration.page.locator('#customer\\.lastName').fill(data.lastName);
  await registration.page.locator('#customer\\.address\\.street').fill(data.address);
  await registration.page.locator('#customer\\.address\\.city').fill(data.city);
  await registration.page.locator('#customer\\.address\\.state').fill(data.state);
  await registration.page.locator('#customer\\.address\\.zipCode').fill(data.zipCode);
  await registration.page.locator('#customer\\.ssn').fill(data.ssn);
  await registration.page.locator('#customer\\.username').fill(credentials.username);
  await registration.page.locator('#customer\\.password').fill(credentials.password);
  await registration.page.locator('#repeatedPassword').fill(credentials.password);
  await registration.submit();
  await expect(registration.page.locator('#rightPanel')).toContainText('This username already exists.');
});
