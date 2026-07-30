import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getRoomsWithStats, ROOM_EMOJI } from "@/lib/chat";
import { getDirectMessageRooms } from "@/lib/actions/chat";
import { RoomsList } from "@/components/rooms-list";
import { ChatWindow } from "@/components/chat-window";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";
import { effectivePresence } from "@/lib/presence";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();

  const room = await prisma.chatRoom.findUnique({
    where: { slug },
    include: {
      members: {
        where: { userId: { not: user.id } },
        include: {
          user: {
            select: {
              name: true,
              username: true,
              avatarUrl: true,
              presence: true,
              lastSeen: true,
            },
          },
        },
      },
    },
  });
  if (!room) notFound();

  const membership = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId: room.id, userId: user.id } },
  });

  if (!membership) {
    if (room.isCommunity) {
      await prisma.chatRoomMember.create({
        data: { roomId: room.id, userId: user.id },
      });
    } else {
      notFound(); // don't leak DM existence
    }
  }

  const isDm = !room.isCommunity;
  const peer = room.members[0]?.user;
  const displayName = isDm && peer ? peer.name : room.name;
  const displayEmoji = isDm && peer ? null : ROOM_EMOJI[room.slug] ?? "💬";

  const [rooms, dms] = await Promise.all([
    getRoomsWithStats(),
    getDirectMessageRooms(user.id),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[340px_1fr]">
      <div className="card hidden space-y-4 p-4 lg:block">
        {dms.length > 0 && (
          <div>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-sage-400">
              Direct messages
            </h2>
            <div className="space-y-1">
              {dms.map((dm) => (
                <Link
                  key={dm.id}
                  href={`/app/chat/${dm.slug}`}
                  className={`flex items-center gap-3 rounded-2xl p-2.5 transition ${
                    slug === dm.slug
                      ? "bg-brand-50 dark:bg-brand-500/15"
                      : "hover:bg-sage-100/60 dark:hover:bg-white/5"
                  }`}
                >
                  <Avatar
                    name={dm.name}
                    src={dm.avatarUrl}
                    size={40}
                    presence={dm.presence}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sage-900 dark:text-white">
                      {dm.name}
                    </p>
                    <p className="truncate text-xs text-sage-500">
                      {dm.lastMessage
                        ? `${dm.lastMessage.sender}: ${dm.lastMessage.text}`
                        : "Start chatting"}
                    </p>
                  </div>
                  {dm.lastMessage && (
                    <span className="shrink-0 text-[10px] text-sage-400">
                      {timeAgo(dm.lastMessage.at)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-sage-400">
            Community rooms
          </h2>
          <RoomsList rooms={rooms} activeSlug={isDm ? undefined : slug} />
        </div>
      </div>
      <div>
        <Link href="/app/chat" className="btn-ghost mb-2 w-fit lg:hidden">
          <ArrowLeft className="h-4 w-4" /> Messenger
        </Link>
        <ChatWindow
          roomId={room.id}
          roomName={displayName}
          roomEmoji={displayEmoji ?? "💬"}
          description={isDm && peer ? `@${peer.username}` : room.description}
          isDm={isDm}
          peerAvatar={isDm && peer ? peer.avatarUrl : null}
          peerPresence={
            isDm && peer ? effectivePresence(peer.presence, peer.lastSeen) : null
          }
        />
      </div>
    </div>
  );
}
