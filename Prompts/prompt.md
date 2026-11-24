You are a senior QA automation engineer. Build a Playwright + TypeScript test automation framework using the Page Object Model (POM) design pattern in this VS Code workspace.

## Application under test
https://parabank.parasoft.com/parabank/index.htm

## Scope
1. **Registration -> Login flow:** register a brand-new user, verify the account is created, log out, then log in with that same newly registered user and verify login succeeds.
2. **Link clickability:** verify that all links in the application are visible, enabled, clickable, and lead to a working page.

Before writing any code, open the application (use Playwright MCP / browser tools if available, otherwise `npx playwright codegen https://parabank.parasoft.com/parabank/index.htm`) and walk through the flows to identify every page, form field, button, link, and message. Do NOT guess locators or behaviour. List any assumptions in the README.

## Browser
Chrome only. Configure a single project in `playwright.config.ts` using `devices['Desktop Chrome']` with `channel: 'chrome'` (fall back to bundled Chromium if Chrome is not installed).

## Credentials and test data (IMPORTANT: no hard-coded credentials)
- No usernames, passwords, or personal details may appear in page objects or spec files.
- Static registration data (first name, last name, address, city, state, zip, phone, SSN) goes in `src/test-data/registrationData.json` with a matching TypeScript interface.
- Base URL goes in `.env` (provide `.env.example`; add `.env` to `.gitignore`).
- ParaBank rejects duplicate usernames, so generate a **unique username at runtime** (e.g. `user_<timestamp>_<random>`) and a password read from `.env` (`PARABANK_PASSWORD`).
- Save the generated credentials of the newly registered user to a separate file, `test-data/generated/registeredUser.json`, and add that folder to `.gitignore`. The login test reads credentials from that file only.
- Create a small `src/utils/credentialStore.ts` with typed `saveCredentials()` and `loadCredentials()` functions. Handle the case where the file is missing, with a clear error message.

## Project structure
```
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── src/
│   ├── pages/
│   │   ├── BasePage.ts
│   │   ├── HomePage.ts              # login panel + left nav + footer links
│   │   ├── RegistrationPage.ts
│   │   ├── AccountsOverviewPage.ts
│   │   └── <others discovered>.ts
│   ├── components/
│   │   └── NavigationMenu.ts        # shared component for nav/footer links
│   ├── fixtures/
│   │   └── pageFixtures.ts          # test.extend fixtures injecting page objects
│   ├── test-data/
│   │   └── registrationData.json
│   └── utils/
│       ├── credentialStore.ts
│       └── dataGenerator.ts
└── tests/
    ├── auth/
    │   ├── registration.spec.ts
    │   └── login.spec.ts
    └── links/
        └── links.spec.ts
```

## Test scenarios

**Registration (`registration.spec.ts`)**
- Register a new user with valid data; assert the welcome message and "Your account was created successfully" text; persist the credentials via `credentialStore`.
- Negative: submit the form with empty mandatory fields and assert each validation message.
- Negative: password and confirm-password mismatch.
- Negative: register with an already-used username (reuse the generated one) and assert the error.

**Login (`login.spec.ts`)**
- Log in as the newly registered user (credentials loaded from the generated file); assert Accounts Overview is displayed and the welcome name matches.
- Log out and assert the login panel is shown again.
- Negative: wrong password; empty username/password. Assert the error messages.
- Login tests must depend on registration through a clean mechanism (e.g. a Playwright `setup` project or `test.describe.serial` plus a `beforeAll` that registers if the credentials file is missing). Do not rely on file-name ordering.

**Links (`links.spec.ts`)**
- Data-driven: build a typed list of every link on the pre-login pages (home page left nav, top nav, footer) and on the post-login pages (account services menu), after discovering them in the live app.
- For each link assert: visible, enabled, has a non-empty `href`, click navigates to the expected URL/heading (or opens in a new tab for external links), and the response is not 4xx/5xx.
- For external links (e.g. Parasoft sites), verify via a new-tab or `request.get` status check rather than depending on the external page's content.
- Use `test.step()` and `test.describe` per group. Generate one test per link so failures are individually reported.
- **Do NOT click the "Initialize" or "Clean" database buttons on the Admin page**, since they reset the shared demo database and break other tests. Verify the Admin Page link only, and the page loads.

## POM rules
1. `BasePage` holds shared logic (navigation, common actions, helpers) that every page extends.
2. Locators are `readonly` properties initialised in the constructor.
3. Pages expose meaningful actions (`registerUser(data)`, `login(username, password)`, `logout()`, `clickLink(name)`), not raw locators.
4. Navigating methods return the next page object where sensible.
5. Page objects contain NO assertions apart from small state getters (e.g. `getWelcomeMessage()`, `isLoaded()`). All assertions live in specs.
6. Specs contain no locators and no hard-coded credentials or personal data.
7. Inject page objects through custom fixtures.

## Locator and wait strategy
- Prefer `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, then CSS. Avoid XPath and nth-child.
- Use auto-waiting and web-first assertions. No `waitForTimeout`.
- ParaBank forms often use `name`/`id` attributes. Use them where roles/labels are not reliable.

## Configuration
- `baseURL` from env with default `https://parabank.parasoft.com/parabank`.
- `fullyParallel: false` for the auth flow (shared state); links tests may run in parallel.
- `retries: 1` on CI, `forbidOnly` on CI, sensible `timeout` and `expect.timeout` (the demo site can be slow).
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`.
- Reporters: `html` and `list`.

## npm scripts
- `test`, `test:auth`, `test:links`, `test:headed`, `report` (`npx playwright show-report`)

## Code quality
- Strict TypeScript, no `any`. Short JSDoc on page classes and public methods. Clear naming.

## Process
1. Post a short plan first: discovered pages, flows, full list of links found, and the page objects you will create. Then proceed.
2. Install dependencies (`@playwright/test`, `dotenv`, TypeScript types) and run `npx playwright install chrome`.
3. Implement the framework and tests.
4. Run `npx playwright test`, fix failures/flakiness, re-run until green.
5. Write a README covering setup, `.env` configuration, how credentials are generated and stored, how to run tests, how to view reports, and assumptions.
6. Finish with a summary of files created and the final test results.