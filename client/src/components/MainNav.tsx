"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "../lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserNav } from "./UserNav";
import NavButton from "./NavButton";

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/orders",
    label: "Orders",
  },
  {
    href: "/wallets",
    label: "Wallets",
  },
  {
    href: "/balances",
    label: "Balances",
  },
];

/**
 * Helper function to determine if a link is active based on current pathname
 */
function useIsActiveLink(href: string) {
  const pathname = usePathname();
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className="flex-1 flex items-center">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <button className="p-2 hover:bg-accent rounded-md">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <div className="flex flex-col gap-2 p-6">
              <Link href="/" className="flex items-center mb-6">
                <Image
                  src="/logo.svg"
                  alt="Enenni"
                  width={100}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
              {navLinks.map((link) => {
                const isActive = useIsActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 text-sm rounded-md transition-colors",
                      isActive
                        ? "text-white"
                        : "text-teal-100 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center justify-center">
          <div className="bg-white inline-block pt-4 shadow-slate-950 p-2 pb-4 pr-4 rounded-b-full clip-[polygon(0_0,100%_0,100%_80%,50%_100%,0_80%)]">
            <Image
              src="/logo.svg"
              alt="Enenni"
              width={100}
              height={100}
              className="h-10 w-auto mx-auto"
              priority
            />
          </div>
        </Link>
      </div>

      <div
        className={cn(
          "hidden md:flex items-center justify-center gap-8 flex-1",
          className
        )}
        {...props}
      >
        {navLinks.map((link) => {
          const isActive = useIsActiveLink(link.href);
          return (
            <NavButton
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={isActive}
            />
          );
        })}
      </div>

      <div className="ml-auto">
        <UserNav />
      </div>
    </nav>
  );
}
