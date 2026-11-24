# ParaBank Playwright TypeScript Automation

This project automates the ParaBank registration/login flow and link clickability with Playwright, TypeScript, and Page Object Model classes.

## Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `PARABANK_PASSWORD` to a password used for generated users.
4. Run `npx playwright install chrome` (Chrome is also supported through the system channel).

## Running tests

- `npm test`
- `npm run test:auth`
- `npm run test:links`
- `npm run test:headed`
- `npm run report`

The auth suite is serial and registration can run independently. Login tests register in `beforeAll` only when `test-data/generated/registeredUser.json` is missing.

## Credentials

Static registration fields are stored in `src/test-data/registrationData.json`. Passwords come only from `PARABANK_PASSWORD`; usernames are generated at runtime. Generated credentials are written to `test-data/generated/registeredUser.json`, which is gitignored. The file is never required to contain hard-coded personal details.

## Assumptions

- Chrome from the configured channel is used; Playwright falls back to bundled Chromium if Chrome is unavailable.
- ParaBank validation text observed in the live application includes “required” messages and “Passwords did not match.”.
- ParaBank external and SOAP/WADL links may vary with network availability; external links are checked through HTTP status where possible.
- Links are collected dynamically from the live pre-login and post-login pages.
- The Admin “Initialize” and “Clean” database actions are never invoked.
