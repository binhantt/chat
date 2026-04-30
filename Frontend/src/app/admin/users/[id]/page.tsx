import Link from "next/link";
import { Button, Flex } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { UserProfileOverview } from "@/components/admin/users/UserProfileOverview";
import { UserProfileActivity } from "@/components/admin/users/UserProfileActivity";
import { UserProfileActions } from "@/components/admin/users/UserProfileActions";
import { UserAccessDialog } from "@/components/admin/users/UserAccessDialog";
import { fetchAdminUserById } from "@/lib/admin-users";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!userId || !refreshToken) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const user = await fetchAdminUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-5 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Flex align="center" justify="between" gap="4" wrap="wrap">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            <ArrowLeftIcon width="16" height="16" />
            Quay lai danh sach user
          </Link>

          <Flex gap="3" wrap="wrap">
            <Button variant="soft" color="gray">
              Dat lai mat khau
            </Button>
            <UserAccessDialog user={user} />
          </Flex>
        </Flex>

        <UserProfileOverview user={user} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <UserProfileActivity user={user} />
          <UserProfileActions user={user} />
        </div>
      </div>
    </main>
  );
}
