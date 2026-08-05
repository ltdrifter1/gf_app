import Link from "next/link";
import { BuddyList, type MsnContact } from "@/components/buddy-list";
import { RoomsList } from "@/components/rooms-list";
import { MsnPresenceIcon } from "@/components/msn-presence-icon";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Dm = {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string | null;
  presence: string;
  lastMessage: { text: string; sender: string; at: string } | null;
};

type Room = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string;
  members: number;
  online: number;
  lastMessage: { text: string; sender: string; at: string } | null;
};

export function ContactListPane({
  onlineCount,
  online,
  offline,
  dms,
  rooms,
  activeSlug,
}: {
  onlineCount: number;
  online: MsnContact[];
  offline: MsnContact[];
  dms: Dm[];
  rooms: Room[];
  activeSlug?: string;
}) {
  return (
    <div className="msn-window h-[calc(100vh-7rem)]">
      <div className="msn-titlebar">
        <MsnPresenceIcon status="online" size={14} />
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold tracking-wide">
          Amity Messenger — Contact List
        </span>
        <span className="text-[10px] text-white/85">{onlineCount} online</span>
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

      <div className="msn-inset m-1.5 min-h-0 flex-1 overflow-y-auto p-1">
        <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wide text-[#555] dark:text-sage-400">
          IMs
        </p>
        <BuddyList online={online} offline={offline} />

        {dms.length > 0 && (
          <div className="mt-3 border-t border-[#c0c0c0] pt-2 dark:border-white/10">
            <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wide text-[#555] dark:text-sage-400">
              Conversations
            </p>
            <div className="space-y-0.5">
              {dms.map((dm) => {
                const active = activeSlug === dm.slug;
                return (
                  <Link
                    key={dm.id}
                    href={`/app/chat/${dm.slug}`}
                    className={cn("msn-contact", active && "msn-contact-active")}
                  >
                    <MsnPresenceIcon status={dm.presence} size={16} className="mt-0.5" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{dm.name}</span>
                      <span className="block truncate text-[11px] opacity-80">
                        {dm.lastMessage
                          ? `${dm.lastMessage.sender}: ${dm.lastMessage.text}`
                          : "Start chatting"}
                      </span>
                    </span>
                    {dm.lastMessage && (
                      <span className="shrink-0 text-[10px] opacity-70">
                        {timeAgo(dm.lastMessage.at)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-3 border-t border-[#c0c0c0] pt-2 dark:border-white/10">
          <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wide text-[#555] dark:text-sage-400">
            Community rooms
          </p>
          <RoomsList rooms={rooms} activeSlug={activeSlug} />
        </div>
      </div>

      <div className="msn-statusbar">
        <MsnPresenceIcon status="online" size={12} />
        <span>Signed in · Click a contact to open a conversation</span>
      </div>
    </div>
  );
}
