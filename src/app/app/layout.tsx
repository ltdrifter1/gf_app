import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { PresenceHeartbeat } from "@/components/presence-heartbeat";
import { OnboardingRedirect } from "@/components/onboarding-redirect";
import { ensureLaunchCatalog } from "@/lib/bootstrap";
import { getMessengerUnreadTotal } from "@/lib/actions/chat";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await ensureLaunchCatalog();

  const [messengerUnread, notificationUnread] = await Promise.all([
    getMessengerUnreadTotal(user.id),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
        presence: user.presence,
      }}
      messengerUnread={messengerUnread}
      notificationUnread={notificationUnread}
    >
      <OnboardingRedirect complete={user.onboardingComplete} />
      <PresenceHeartbeat />
      {children}
    </AppShell>
  );
}
