import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { OnboardingForm } from "@/components/onboarding-form";
import { COMPANION_GOALS } from "@/lib/companion";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardingComplete) redirect("/app/chat");

  return (
    <div className="mx-auto max-w-lg space-y-6 py-4">
      <div>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">Welcome, {user.name}</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-sage-900 dark:text-white">
          Let&apos;s find your people
        </h1>
        <p className="mt-2 text-sage-500 dark:text-sage-400">
          One short setup — then we match you to rooms, nearby safe dining, and members who get it.
        </p>
      </div>
      <OnboardingForm
        defaultDiagnosis={user.profile?.diagnosis || "celiac"}
        defaultLocation={user.location || ""}
        goals={[...COMPANION_GOALS]}
      />
    </div>
  );
}
