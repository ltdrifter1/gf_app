import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getRoomsWithStats, ROOM_EMOJI } from "@/lib/chat";
import { RoomsList } from "@/components/rooms-list";
import { ChatWindow } from "@/components/chat-window";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();

  const room = await prisma.chatRoom.findUnique({ where: { slug } });
  if (!room) notFound();

  if (room.isPremium && !user.isPremium) {
    redirect("/app/premium");
  }

  await prisma.chatRoomMember.upsert({
    where: { roomId_userId: { roomId: room.id, userId: user.id } },
    create: { roomId: room.id, userId: user.id },
    update: {},
  });

  const rooms = await getRoomsWithStats({ includePremium: user.isPremium });

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[340px_1fr]">
      <div className="card hidden p-4 lg:block">
        <h1 className="px-1 pb-3 font-display text-xl font-bold text-sage-900 dark:text-white">
          Messenger
        </h1>
        <RoomsList rooms={rooms} activeSlug={slug} />
      </div>
      <div>
        <Link href="/app/chat" className="btn-ghost mb-2 w-fit lg:hidden">
          <ArrowLeft className="h-4 w-4" /> All rooms
        </Link>
        <ChatWindow
          roomId={room.id}
          roomName={room.name}
          roomEmoji={ROOM_EMOJI[room.slug] ?? "💬"}
          description={room.description}
        />
      </div>
    </div>
  );
}
