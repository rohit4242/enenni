import apiClient from "./client";
import { z } from "zod";

// Define the pagination response type
export interface PaginatedResponse<T> {
  orders: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Define type-safe filter parameters
export const OrderFilterSchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  asset: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type OrderFilterParams = z.infer<typeof OrderFilterSchema>;

// Fetch all orders with proper typing and validation
export const getOrders = async (filterParams?: OrderFilterParams) => {
  try {
    const response = await apiClient.get("/orders", {
      params: filterParams,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw new Error("Failed to fetch orders");
  }
};

// Fetch a specific order by ID
export const getOrderById = async (orderId: string) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data.order;
  } catch (error) {
    console.error(`Failed to fetch order ${orderId}:`, error);
    throw new Error(`Failed to fetch order ${orderId}`);
  }
};

export const createOrder = async (orderData: {
  type: string;
  asset: string;
  quantity: number;
  pricePerToken: number;
  totalAmount: number;
  currency: string;
  referenceId: string;
}) => {
  try {
    const response = await apiClient.post("/orders", orderData);
    return response.data.order;
  } catch (error) {
    console.error("Failed to create order:", error);
    throw new Error("Failed to create order");
  }
};

// Cancel an order
export const cancelOrder = async (orderId: string) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error(`Failed to cancel order ${orderId}:`, error);
    throw new Error(`Failed to cancel order`);
  }
};

// Admin: Update order status
export interface UpdateOrderStatusData {
  orderId: string;
  status: string;
}

export const updateOrderStatus = async (data: UpdateOrderStatusData) => {
  try {
    const response = await apiClient.put("/orders/admin/status", data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update order status:`, error);
    throw new Error(`Failed to update order status`);
  }
};

// Admin: Get all orders
export const getAllOrders = async (filterParams?: OrderFilterParams) => {
  try {
    const response = await apiClient.get("/orders/admin/all", {
      params: filterParams,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch all orders:", error);
    throw new Error("Failed to fetch all orders");
  }
};
