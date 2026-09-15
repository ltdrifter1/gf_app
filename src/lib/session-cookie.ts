/** Dual-read session cookie: current name first, then legacy. */

export function pickSessionToken(
  get: (name: string) => { value: string } | undefined,
  currentName: string,
  legacyName: string
) {
  return get(currentName)?.value ?? get(legacyName)?.value ?? null;
}
