import { MainNav } from "@/components/MainNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <header className="sticky top-0 z-50 w-full bg-[#06071B]">
        <div className="container max-w-screen-xl mx-auto flex h-16 items-center">
          <MainNav className="mx-6" />
        </div>
      </header>
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#06071B] to-[#06071B]" />
      <div className="relative">
        <div className="max-w-screen-xl mx-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
