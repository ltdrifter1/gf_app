/** DMs with a null accepted timestamp are message requests. */

export function isPendingDm(room: { kind: string; dmAcceptedAt: Date | null | undefined }) {
  return room.kind === "dm" && room.dmAcceptedAt == null;
}
