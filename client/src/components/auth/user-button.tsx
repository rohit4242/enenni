"use client";

import { ExitIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsIcon, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
export const UserButton = () => {
  const { user } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image || undefined} />
          <AvatarFallback className="bg-neutral-700 text-white">
            <User />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <LogoutButton>
          <DropdownMenuItem>
            <ExitIcon className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </LogoutButton>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2" prefetch>
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
