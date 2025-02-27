"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@prisma/client";
import { DateRange } from "react-day-picker";
import { useCallback } from "react";

import { columns } from "./columns";
import { DateRangePicker } from "./date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleExportOrdersCSV } from "@/lib/utils";

export function OrdersDataTable() {
  const { toast } = useToast();
  const [data, setData] = React.useState<Order[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [rowsPerPage] = React.useState(10);
  const [lastUpdated, setLastUpdated] = React.useState<string>("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: rowsPerPage,
  });

  React.useEffect(() => {
    const updateLastUpdated = () => {
      setLastUpdated(new Date().toLocaleString());
    };
    updateLastUpdated();
    const interval = setInterval(updateLastUpdated, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const searchParams = new URLSearchParams();
      
      if (dateRange?.from) {
        searchParams.set("startDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        searchParams.set("endDate", dateRange.to.toISOString());
      }
      
      const search = table.getColumn("referenceId")?.getFilterValue() as string;
      if (search) {
        searchParams.set("search", search);
      }

      const response = await fetch(`/api/orders?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      
      const orders = await response.json();
      setData(orders);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    manualPagination: false,
    pageCount: Math.ceil(data.length / rowsPerPage),
  });

  React.useEffect(() => {
    fetchOrders();
  }, [dateRange, fetchOrders]);

  const handleRefresh = () => {
    fetchOrders();
  };

  React.useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageSize: rowsPerPage,
    }));
  }, [rowsPerPage]);

  return (
    <div className="space-y-2 sm:space-y-4 bg-white rounded-lg p-4 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {lastUpdated ? `Last updated: ${lastUpdated}` : "Loading..."}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Input
            placeholder="Search by Order #..."
            value={(table.getColumn("referenceId")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("referenceId")?.setFilterValue(event.target.value)
            }
            className="w-full sm:max-w-sm"
          />
          <DateRangePicker 
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>

        <div className="flex items-center gap-2">
        
          <Button onClick={() => handleExportOrdersCSV(table)} size="sm">
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Loading..." : "No orders found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} of{" "}
          {data.length} orders
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="flex items-center justify-center text-xs sm:text-sm font-medium">
            Page {pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
