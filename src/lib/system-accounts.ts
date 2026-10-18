/**
 * Service accounts that speak as Lumen, not as members you can match or sign in as.
 * The host password is random, set only in the catalog bootstrap, and never printed.
 */

export const LUMEN_HOST_EMAIL = "host@lumen.internal";
export const LUMEN_HOST_USERNAME = "lumen-host";

export function isLumenHostAccount(user: {
  username?: string | null;
  email?: string | null;
}) {
  const email = user.email?.trim().toLowerCase();
  const username = user.username?.trim().toLowerCase();
  return email === LUMEN_HOST_EMAIL || username === LUMEN_HOST_USERNAME;
}

/** Prisma UserWhereInput fragment: drop the non-loginable Lumen Host from people queries. */
export const notLumenHost = {
  NOT: {
    OR: [{ username: LUMEN_HOST_USERNAME }, { email: LUMEN_HOST_EMAIL }],
  },
};
