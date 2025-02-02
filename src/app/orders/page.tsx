import { Separator } from "@/components/ui/separator";
import { OrdersDataTable } from "./components/data-table";

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage your orders
          </p>
        </div>
        <Separator />
        <OrdersDataTable />
      </div>
    </div>
  );
}
