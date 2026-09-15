import { requireUser } from "@/lib/auth";
import { getRoomsWithStats } from "@/lib/chat";
import { getContactList, getIncomingDmRequests } from "@/lib/actions/chat";
import { ContactListPane } from "@/components/contact-list-pane";
import { MessengerHomePane } from "@/components/messenger-home-pane";
import { MessengerShell } from "@/components/messenger-shell";
import { DmRequests } from "@/components/dm-requests";
import { effectivePresence } from "@/lib/presence";

export default async function ChatHome() {
  const user = await requireUser();
  const [rooms, contacts, requests] = await Promise.all([
    getRoomsWithStats(user.id),
    getContactList(user.id),
    getIncomingDmRequests(user.id),
  ]);

  const me = {
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    presence: effectivePresence(user.presence, user.lastSeen),
    statusMessage: user.profile?.mood?.trim() || null,
  };

  const cityTonight = rooms.find((r) => r.kind === "city-tonight");

  return (
    <MessengerShell
      sidebar={
        <ContactListPane
          embedded
          onlineCount={contacts.onlineCount}
          online={contacts.online}
          offline={contacts.offline}
          rooms={rooms}
          me={me}
          panicBuddyId={user.profile?.panicBuddyId ?? null}
        />
      }
      main={
        <div className="flex h-full min-h-0 flex-col gap-3">
          <DmRequests requests={requests} />
          <MessengerHomePane
            embedded
            me={me}
            onlineCount={contacts.onlineCount}
            online={contacts.online}
            cityTonightSlug={cityTonight?.slug ?? null}
          />
        </div>
      }
    />
  );
}
