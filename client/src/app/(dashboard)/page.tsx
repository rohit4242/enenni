import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Layout() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }
  // Redirect to dashboard if already authenticated
  redirect("/dashboard");
}
