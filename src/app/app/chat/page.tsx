import { requireUser } from "@/lib/auth";
import { getRoomsWithStats } from "@/lib/chat";
import { getContactList } from "@/lib/actions/chat";
import { ContactListPane } from "@/components/contact-list-pane";
import { MessengerHomePane } from "@/components/messenger-home-pane";
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
    <div className="mx-auto grid h-full min-h-0 w-full max-w-6xl gap-3 lg:grid-cols-[320px_1fr]">
      <ContactListPane
        onlineCount={contacts.onlineCount}
        online={contacts.online}
        offline={contacts.offline}
        rooms={rooms}
        me={me}
      />
      <MessengerHomePane
        me={me}
        onlineCount={contacts.onlineCount}
        online={contacts.online}
        rooms={rooms}
      />
    </div>
  );
}
