"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserNav } from "./UserNav";
import { useEffect } from "react";
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

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (
      status === "unauthenticated" &&
      (pathname.startsWith("/wallets") || pathname.startsWith("/balances"))
    ) {
      router.push("/auth/login");
    }
  }, [status, pathname, router]);

  const isActiveLink = (href: string) => {
    if (href === "/wallets" || href === "/balances") {
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
                  alt="Enenni"
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
                    "px-3 py-2 text-sm rounded-md transition-colors",
                    isActiveLink(link.href)
                      ? "text-white"
                      : "text-teal-100 hover:text-white"
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
            alt="Enenni"
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
          <NavButton
            key={link.href}
            href={link.href}
            label={link.label}
            isActive={isActiveLink(link.href)}
          />
        ))}
      </div>

      <div className="ml-auto">
        <UserNav />
      </div>
    </nav>
  );
}
