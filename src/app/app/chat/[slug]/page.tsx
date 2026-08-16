import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getRoomsWithStats, ROOM_EMOJI } from "@/lib/chat";
import { getContactList } from "@/lib/actions/chat";
import { ContactListPane } from "@/components/contact-list-pane";
import { ChatWindow } from "@/components/chat-window";
import { MessengerRoomShell } from "@/components/messenger-shell";
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
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
      <Link href="/app/chat" className="btn-ghost mb-2 w-fit lg:hidden">
        <ArrowLeft className="h-4 w-4" /> Back to Messenger
      </Link>
      <MessengerRoomShell
        sidebar={
          <ContactListPane
            embedded
            onlineCount={contacts.onlineCount}
            online={contacts.online}
            offline={contacts.offline}
            rooms={rooms}
            activeSlug={slug}
            me={me}
          />
        }
        main={
          <ChatWindow
            embedded
            roomId={room.id}
            roomName={displayName}
            roomEmoji={displayEmoji ?? "💬"}
            roomSlug={room.slug}
            description={isDm && peer ? `@${peer.username}` : room.description}
            isDm={isDm}
            peerAvatar={isDm && peer ? peer.avatarUrl : null}
            peerPresence={
              isDm && peer ? effectivePresence(peer.presence, peer.lastSeen) : null
            }
            peerStatusMessage={isDm && peer ? peer.profile?.mood ?? null : null}
            rooms={rooms}
          />
        }
      />
    </div>
  );
}
