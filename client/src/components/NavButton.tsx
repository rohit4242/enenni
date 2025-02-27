import { FC } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "../lib/utils";

interface NavButtonProps {
  href: string;
  label: string;
  isActive?: boolean;
}

const NavButton: FC<NavButtonProps> = ({ href, label, isActive }) => {
  return (
    <Button
      asChild
      variant={"outline"}
      className={cn(
        "w-full lg:w-auto justify-center font-medium hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition",
        isActive ? "bg-white/10 text-white" : "bg-transparent"
      )}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};

export default NavButton;