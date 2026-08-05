/** Special message content used for MSN-style nudges. */
export const NUDGE_CONTENT = "::nudge::";

export function isNudgeMessage(content: string) {
  return content.trim() === NUDGE_CONTENT;
}

export function nudgeSystemLine(senderName: string, mine: boolean) {
  return mine
    ? `You have sent ${senderName} a nudge!`
    : `${senderName} has sent you a nudge!`;
}
