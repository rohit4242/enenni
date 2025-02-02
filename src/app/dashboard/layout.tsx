
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen max-w-screen-lg mx-auto">
    
      <div className="flex flex-col w-full ">
        {children}
      </div>
    </div>
  );
}
