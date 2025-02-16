import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MainNav } from "@/components/MainNav";
import { QueryProvider } from "@/components/providers/query-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ClientOnly } from "@/components/ClientOnly";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enenni",
  description: "Enenni is a platform for creating and managing your own crypto currencies",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <ClientOnly>
                <header className="sticky top-0 z-50 w-full bg-teal-600">
                  <div className="container max-w-screen-xl mx-auto flex h-16 items-center">
                    <MainNav className="mx-6" />
                  </div>
                </header>
              </ClientOnly>
              {children}
            </div>
            <ClientOnly>
              <ModalProvider />
              <Toaster />
            </ClientOnly>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
