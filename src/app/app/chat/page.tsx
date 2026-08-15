import { requireUser } from "@/lib/auth";
import { getRoomsWithStats } from "@/lib/chat";
import { getContactList } from "@/lib/actions/chat";
import { ContactListPane } from "@/components/contact-list-pane";
import { effectivePresence } from "@/lib/presence";

export default async function ChatHome() {
  const user = await requireUser();
  const [rooms, contacts] = await Promise.all([
    getRoomsWithStats(user.id),
    getContactList(user.id),
  ]);

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-md flex-1 flex-col lg:max-w-lg">
      <ContactListPane
        className="msn-window-fill-with-dock"
        onlineCount={contacts.onlineCount}
        online={contacts.online}
        offline={contacts.offline}
        rooms={rooms}
        me={{
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
          presence: effectivePresence(user.presence, user.lastSeen),
          statusMessage: user.profile?.mood?.trim() || null,
        }}
      />
    </div>
  );
}
