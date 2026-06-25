import { requireUser } from "@/lib/auth";
import { AssistantChat } from "@/components/assistant-chat";

export default async function AssistantPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-3xl">
      <AssistantChat />
    </div>
  );
}
