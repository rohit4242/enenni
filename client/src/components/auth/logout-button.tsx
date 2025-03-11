"use client";

import { logoutUser } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();

  const onClick = async () => {
    await logoutUser();
    router.replace("/auth/login");
    router.refresh();
  };

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
