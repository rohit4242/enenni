import { ProtectedRoute } from "@/components/auth/protected-route";

export default function WalletsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen relative">
        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-teal-600 to-teal-500" />
        <div className="relative">
          <div className="max-w-screen-xl mx-auto p-6">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
