import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { AuthProvider } from "@/context/AuthContext";
import { HydrationSafeProvider } from "@/components/HydrationSafeProvider";
import { HydrationErrorBoundary } from "@/components/HydrationErrorBoundary";

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <HydrationErrorBoundary>
            <HydrationSafeProvider
              fallback={
                <div className="flex min-h-screen flex-col items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-primary"></div>
                </div>
              }
            >
              <AuthProvider>
                <div className="flex min-h-screen flex-col">
                  {children}
                </div>
                <ModalProvider />
                <Toaster />
              </AuthProvider>
            </HydrationSafeProvider>
          </HydrationErrorBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}