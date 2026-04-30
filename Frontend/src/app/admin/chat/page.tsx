import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChatManagementOverview } from "@/components/admin/chat/ChatManagementOverview";
import { ChatManagementTable } from "@/components/admin/chat/ChatManagementTable";

export default async function AdminChatPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!userId || !refreshToken) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen px-4 py-5 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ChatManagementOverview />
        <ChatManagementTable />
      </div>
    </main>
  );
}
