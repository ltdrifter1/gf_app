import { requireUser } from "@/lib/auth";
import { getRoomsWithStats } from "@/lib/chat";
import { getContactList } from "@/lib/actions/chat";
import { ContactListPane } from "@/components/contact-list-pane";
import { MessengerHomePane } from "@/components/messenger-home-pane";
import { MessengerShell } from "@/components/messenger-shell";
import { effectivePresence } from "@/lib/presence";

export default async function ChatHome() {
  const user = await requireUser();
  const [rooms, contacts] = await Promise.all([
    getRoomsWithStats(user.id),
    getContactList(user.id),
  ]);

  const me = {
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    presence: effectivePresence(user.presence, user.lastSeen),
    statusMessage: user.profile?.mood?.trim() || null,
  };

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
        />
      }
      main={
        <MessengerHomePane
          embedded
          me={me}
          onlineCount={contacts.onlineCount}
          online={contacts.online}
          rooms={rooms}
        />
      }
    />
  );
}
