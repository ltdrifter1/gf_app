"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function OnboardingRedirect({ complete }: { complete: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (complete) return;
    if (pathname.startsWith("/app/onboarding")) return;
    router.replace("/app/onboarding");
  }, [complete, pathname, router]);

  return null;
}
