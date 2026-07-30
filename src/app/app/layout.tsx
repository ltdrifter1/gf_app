import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { PresenceHeartbeat } from "@/components/presence-heartbeat";
import { ensureLaunchCatalog } from "@/lib/bootstrap";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await ensureLaunchCatalog();

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
    >
      <PresenceHeartbeat />
      {children}
    </AppShell>
  );
}
