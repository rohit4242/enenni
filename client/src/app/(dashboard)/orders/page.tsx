import { OrdersDataTable } from "./components/data-table";

export default function OrdersPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">
          Orders
        </h1>
        <p className="text-teal-100">View and manage your orders</p>
      </div>
      <OrdersDataTable />
    </div>
  );
}
