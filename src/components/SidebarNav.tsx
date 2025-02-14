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
        "flex flex-col gap-2 p-4 bg-teal-500 text-white rounded-lg shadow-md",
        className
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "w-full justify-center font-medium hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition p-2 rounded-md",
            pathname === item.href ? "bg-white/10 text-white" : "bg-transparent"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}