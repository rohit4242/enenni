"use client";

import { useRouter } from "next/navigation";
import { logout } from "../../lib/actions/logout";

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();

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
