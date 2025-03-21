"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "../lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserNav } from "./UserNav";
import NavButton from "./NavButton";
import { Button } from "./ui/button";
import { useState } from "react";

const navLinks = [
  {
    href: "/",
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
  return pathname === href || pathname?.startsWith(`${href}/`);
}

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex-1 flex items-center">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button className="p-2 hover:bg-accent bg-slate-100 rounded-md">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 bg-gradient-to-b from-[#06071B] to-[#0d0e29] border-r border-teal-900/30">
            <SheetTitle className="hidden">Enenni</SheetTitle>
            <div className="flex flex-col gap-4 p-6">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center justify-center mb-6">
                <div className="bg-white inline-block pt-4 shadow-sm p-2 pb-4 pr-4 rounded-b-full clip-[polygon(0_0,100%_0,100%_80%,50%_100%,0_80%)]">
                  <Image
                    src="/logo.svg"
                    alt="Enenni"
                    width={100}
                    height={40}
                    className="h-10 w-auto"
                    priority
                  />
                </div>
              </Link>
              {navLinks.map((link) => {
                const isActive = useIsActiveLink(link.href);
                return (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "relative px-4 py-3 text-sm rounded-md transition-colors flex items-center",
                      isActive
                        ? "text-white bg-white/10 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-teal-400 before:rounded-r-md"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <Link href={link.href} className="w-full">
                      {link.label}
                    </Link>
                  </Button>
                );
              })}

              <div className="mt-auto pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  className="w-full bg-transparent text-white border-teal-400/50 hover:bg-teal-400/10"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/settings">Settings</Link>
                </Button>
              </div>
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
