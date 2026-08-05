import { requireUser } from "@/lib/auth";
import { getRoomsWithStats } from "@/lib/chat";
import { getContactList, getDirectMessageRooms } from "@/lib/actions/chat";
import { ContactListPane } from "@/components/contact-list-pane";
import { MsnPresenceIcon } from "@/components/msn-presence-icon";

export default async function ChatHome() {
  const user = await requireUser();
  const [rooms, contacts, dms] = await Promise.all([
    getRoomsWithStats(),
    getContactList(user.id),
    getDirectMessageRooms(user.id),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-3 lg:grid-cols-[340px_1fr]">
      <ContactListPane
        onlineCount={contacts.onlineCount}
        online={contacts.online}
        offline={contacts.offline}
        dms={dms}
        rooms={rooms}
      />

      <div className="msn-window hidden h-[calc(100vh-7rem)] lg:flex">
        <div className="msn-titlebar">
          <MsnPresenceIcon status="online" size={14} />
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold tracking-wide">
            Amity Messenger
          </span>
          <span className="msn-titlebar-btn" aria-hidden>
            _
          </span>
          <span className="msn-titlebar-btn" aria-hidden>
            □
          </span>
          <span className="msn-titlebar-btn" aria-hidden>
            ×
          </span>
        </div>
        <div className="msn-menubar">
          <button type="button">File</button>
          <button type="button">Contacts</button>
          <button type="button">Actions</button>
          <button type="button">Tools</button>
          <button type="button">Help</button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#f5f4ec] px-8 text-center dark:bg-[#1a2433]">
          <div className="grid h-16 w-16 place-items-center rounded-sm border border-[#7f9db9] bg-gradient-to-br from-[#5eb1ef] to-[#0d5aa8] text-3xl text-white shadow-glow">
            💬
          </div>
          <h2 className="font-display text-xl font-bold text-[#0a246a] dark:text-white">
            Pick a contact or a room
          </h2>
          <p className="max-w-sm text-[13px] text-[#444] dark:text-sage-400">
            Double-click energy optional — one click opens an Instant Message window.
            Nudge when they go quiet.
          </p>
        </div>
        <div className="msn-statusbar">
          <MsnPresenceIcon status="online" size={12} />
          <span>
            Signed in as {user.name} · {contacts.onlineCount} online
          </span>
        </div>
      </div>
    </div>
  );
}
