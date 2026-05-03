import { redirect } from "next/navigation";

export default function HomePage() {
  // Server-side: default redirect to /login.
  // Client-side smart redirect happens inside login page.
  redirect("/login");
}
