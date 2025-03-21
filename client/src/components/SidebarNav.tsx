"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  items: {
    href: string
    title: string
  }[]
  className?: string
}

export function SidebarNav({ className, items }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "md:flex md:flex-col md:gap-2 md:p-4 md:bg-[#070822] md:text-white md:rounded-lg md:shadow-md",
        // Mobile: horizontal scrollable nav
        "flex overflow-x-auto whitespace-nowrap py-2 px-1 gap-2 md:overflow-x-visible md:whitespace-normal",
        className
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "font-medium hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-slate-500/10 transition p-2 rounded-md",
            // Mobile: inline-flex with fixed width to ensure all items are visible in scroll
            "inline-flex flex-shrink-0 md:w-full justify-center min-w-[150px] md:min-w-0",
            pathname === item.href 
              ? "bg-slate-500/10 text-white" 
              : "bg-transparent md:bg-transparent bg-[#070822]"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}