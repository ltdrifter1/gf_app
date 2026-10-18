import { describe, expect, it } from "vitest";
import { COMMUNITY_ROOMS, HOST_ROOM_GREETINGS, HOST_WELCOME_POST } from "../../prisma/catalog";
import { emptyThreadMessage } from "@/lib/empty-thread";
import { isLumenHostAccount, LUMEN_HOST_EMAIL, LUMEN_HOST_USERNAME, notLumenHost } from "@/lib/system-accounts";

describe("Lumen Host warm start", () => {
  it("identifies the non-loginable host by email or username", () => {
    expect(isLumenHostAccount({ email: LUMEN_HOST_EMAIL })).toBe(true);
    expect(isLumenHostAccount({ email: "  Host@Lumen.Internal " })).toBe(true);
    expect(isLumenHostAccount({ username: LUMEN_HOST_USERNAME })).toBe(true);
    expect(isLumenHostAccount({ username: "Maya", email: "maya@lumen.app" })).toBe(false);
  });

  it("excludes the host from people queries", () => {
    expect(notLumenHost).toEqual({
      NOT: {
        OR: [{ username: "lumen-host" }, { email: "host@lumen.internal" }],
      },
    });
  });

  it("publishes one start-here welcome post", () => {
    expect(HOST_WELCOME_POST.title).toBe("Welcome to Lumen 💛 Start here");
    expect(HOST_WELCOME_POST.category).toBe("newly-diagnosed");
    expect(HOST_WELCOME_POST.content).toContain("Find me a buddy");
  });

  it("greets every community room", () => {
    for (const room of COMMUNITY_ROOMS) {
      expect(HOST_ROOM_GREETINGS[room.slug]?.length).toBeGreaterThan(20);
    }
  });

  it("uses a first-voice line in empty community rooms and the classic hello in DMs", () => {
    expect(emptyThreadMessage(false)).toContain("You're the first one here");
    expect(emptyThreadMessage(true)).toBe("This is the beginning of your conversation. Say hello!");
  });
});
