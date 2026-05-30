import { ExitIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function AdminLogoutButton() {
  return (
    <form action={logoutAction}>
      <Button color="red" size="2" type="submit" variant="soft" style={{ borderRadius: 8 }}>
        <ExitIcon />
        Đăng xuất
      </Button>
    </form>
  );
}

async function logoutAction() {
  "use server";

  const cookieStore = await cookies();

  for (const name of ["access_token", "refresh_token", "user_id", "csrf_token"]) {
    cookieStore.delete(name);
  }

  redirect("/admin/login");
}
