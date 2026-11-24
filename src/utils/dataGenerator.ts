/** Creates a unique username suitable for the shared ParaBank demo database. */
export function generateUsername(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `qa${Date.now().toString(36)}${random}`;
}
