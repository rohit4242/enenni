"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginButton from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { UserButton } from "./auth/user-button";

const navLinks = [
  {
    href: "/dashboard",
    label: "Buy & Sell",
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
    href: "/bank-accounts",
    label: "Bank Accounts",
  },

];

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  console.log(pathname);
  const isActiveLink = (href: string) => {
    if (href === "/wallets" || href === "/bank-accounts") {
      return pathname.startsWith(href);
    }
    return pathname === href;
  };

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
                  alt="Fuze"
                  width={100}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium p-2 rounded-md hover:bg-accent",
                    isActiveLink(link.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="Fuze"
            width={100}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </div>

      <div
        className={cn(
          "hidden md:flex items-center justify-center gap-8 flex-1",
          className
        )}
        {...props}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors",
              isActiveLink(link.href)
                ? "text-primary underline underline-offset-8"
                : "text-muted-foreground hover:text-primary hover:underline hover:underline-offset-8"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="ml-auto">
        {session ? (
          <UserButton />
        ) : (
          <LoginButton mode="modal" asChild>
            <Button variant="secondary">
              Sign in
            </Button>
          </LoginButton>
        )}
      </div>
    </nav>
  );
}
