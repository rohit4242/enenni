
export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen max-w-screen-xl mx-auto">
     
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 