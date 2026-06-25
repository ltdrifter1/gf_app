import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAssistantAnswer } from "@/lib/ai";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const messages = await prisma.aiMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const question = String(body.question || "").trim();
  if (!question) return NextResponse.json({ error: "empty" }, { status: 400 });

  const history = await prisma.aiMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  await prisma.aiMessage.create({ data: { userId: user.id, role: "user", content: question } });
  const answer = await getAssistantAnswer(question, history);
  const saved = await prisma.aiMessage.create({
    data: { userId: user.id, role: "assistant", content: answer.content },
  });

  return NextResponse.json({
    id: saved.id,
    content: answer.content,
    sources: answer.sources,
    medical: answer.medical,
  });
}
