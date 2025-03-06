"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();
  const { logout } = useAuth();

  const onClick = async () => {
    await logout();
    router.replace("/auth/login");
    router.refresh()
  };

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
