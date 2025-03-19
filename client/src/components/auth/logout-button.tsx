"use client";

import { logoutUser } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();

  const onClick = async () => {
    await logoutUser();
    
    // Ensure all auth cookies are removed/reset to prevent cached states
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("email_verified");
    Cookies.remove("login_verified");
    Cookies.remove("user_email");
    Cookies.remove("auth_stage");
    
    router.replace("/auth/login");
    router.refresh();
  };

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
