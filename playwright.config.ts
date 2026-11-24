import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'node:fs';

dotenv.config();

function chromeChannel(): 'chrome' | undefined {
  const candidates = [
    process.env.PROGRAMFILES
      ? `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`
      : '',
    process.env['PROGRAMFILES(X86)']
      ? `${process.env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`
      : '',
  ];
  return candidates.some((candidate) => candidate && fs.existsSync(candidate)) ? 'chrome' : undefined;
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 15_000 },
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.PARABANK_BASE_URL ?? 'https://parabank.parasoft.com/parabank',
    channel: chromeChannel(),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'Chrome', use: { ...devices['Desktop Chrome'] } }],
});
