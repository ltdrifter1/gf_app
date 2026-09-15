/** Special message content used for MSN-style nudges. */
export const NUDGE_CONTENT = "::nudge::";
/** Private glutening check-in — no details, just a wave. */
export const CHECKIN_CONTENT = "::checkin::";

export function isNudgeMessage(content: string) {
  return content.trim() === NUDGE_CONTENT;
}

export function isCheckinMessage(content: string) {
  return content.trim() === CHECKIN_CONTENT;
}

export function nudgeSystemLine(senderName: string, mine: boolean) {
  return mine
    ? `You have sent ${senderName} a nudge!`
    : `${senderName} has sent you a nudge!`;
}

export function checkinSystemLine(senderName: string, mine: boolean) {
  return mine
    ? `You asked ${senderName} for a gentle check-in. No details were shared.`
    : `${senderName} asked for a gentle check-in. No details were shared — just a hello when you can.`;
}
