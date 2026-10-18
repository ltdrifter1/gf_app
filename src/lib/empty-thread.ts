/** Empty-thread copy. Community rooms invite the first voice; DMs keep the classic hello. */
export function emptyThreadMessage(isDm: boolean) {
  return isDm
    ? "This is the beginning of your conversation. Say hello!"
    : "You're the first one here 🌱 Say hi — even a quick hello makes the room feel lived in for the next person.";
}
