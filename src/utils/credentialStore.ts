import fs from 'node:fs';
import path from 'node:path';

export interface RegisteredCredentials {
  username: string;
  password: string;
}

const credentialsPath = path.resolve(process.cwd(), 'test-data/generated/registeredUser.json');

/** Persists generated credentials outside source control. */
export function saveCredentials(credentials: RegisteredCredentials): void {
  fs.mkdirSync(path.dirname(credentialsPath), { recursive: true });
  fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), 'utf8');
}

/** Loads generated credentials or throws a clear setup error. */
export function loadCredentials(): RegisteredCredentials {
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      'Registered credentials are missing. Run the registration test or the auth suite before login tests.',
    );
  }
  const value = JSON.parse(fs.readFileSync(credentialsPath, 'utf8')) as Partial<RegisteredCredentials>;
  if (!value.username || !value.password) {
    throw new Error('Registered credentials file is invalid or incomplete.');
  }
  return { username: value.username, password: value.password };
}
