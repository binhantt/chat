import { AuthPage, GoogleLoginForm } from "@/features/auth";

export default function UserLoginPage() {
  return (
    <AuthPage
      badge="Google"
      titleLine1="Chao mung den"
      titleHighlight="Dang nhap User"
      description="Dang nhap nhanh bang Google de vao ung dung va dong bo quyen truy cap theo tai khoan cua ban."
      mode="user"
    >
      <GoogleLoginForm />
    </AuthPage>
  );
}
