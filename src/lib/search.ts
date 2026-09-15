export function containsI(query: string) {
  return { contains: query, mode: "insensitive" as const };
}

export function equalsI(value: string) {
  return { equals: value, mode: "insensitive" as const };
}
