/** Following feed: posts from people you follow — never your own, never an empty-in-list that shows everyone. */
export function followingAuthorFilter(followIds: string[]):
  | { empty: true }
  | { empty: false; authorId: { in: string[] } } {
  const ids = [...new Set(followIds.filter(Boolean))];
  if (ids.length === 0) return { empty: true };
  return { empty: false, authorId: { in: ids } };
}
