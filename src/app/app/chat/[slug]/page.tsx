import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getRoomsWithStats, ROOM_EMOJI } from "@/lib/chat";
import { getContactList, getDirectMessageRooms } from "@/lib/actions/chat";
import { ContactListPane } from "@/components/contact-list-pane";
import { ChatWindow } from "@/components/chat-window";
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
              profile: { select: { mood: true } },
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
      notFound();
    }
  }

  const isDm = !room.isCommunity;
  const peer = room.members[0]?.user;
  const displayName = isDm && peer ? peer.name : room.name;
  const displayEmoji = isDm && peer ? null : ROOM_EMOJI[room.slug] ?? "💬";

  const [rooms, contacts, dms] = await Promise.all([
    getRoomsWithStats(),
    getContactList(user.id),
    getDirectMessageRooms(user.id),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-3 lg:grid-cols-[340px_1fr]">
      <div className="hidden lg:block">
        <ContactListPane
          onlineCount={contacts.onlineCount}
          online={contacts.online}
          offline={contacts.offline}
          dms={dms}
          rooms={rooms}
          activeSlug={slug}
        />
      </div>
      <div>
        <Link href="/app/chat" className="btn-ghost mb-2 w-fit lg:hidden">
          <ArrowLeft className="h-4 w-4" /> Contact List
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
          peerStatusMessage={isDm && peer ? peer.profile?.mood ?? null : null}
        />
      </div>
    </div>
  );
}
