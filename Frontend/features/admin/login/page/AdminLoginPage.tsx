
import {
  AdminAuthPanel,
  AdminAuthShell,
  AdminLoginCopy,
  AdminLoginFooter,
  AdminLoginForm,
} from "../components";

export function AdminLoginPage() {
  return (
    <AdminAuthShell>
      <AdminAuthPanel>
        <AdminLoginCopy />
        <AdminLoginForm />
        <AdminLoginFooter />
      </AdminAuthPanel>
    </AdminAuthShell>
  );
}
