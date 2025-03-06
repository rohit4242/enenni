import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const createOrderSchema = z.object({
  type: z.string().min(1, 'Order type is required'),
  asset: z.string().min(1, 'Asset is required'),
  quantity: z.number().positive('Quantity must be positive'),
  pricePerToken: z.number().positive('Price per token must be positive'),
  totalAmount: z.number().positive('Total amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  referenceId: z.string().min(1, 'Reference ID is required'),
});

export const updateOrderStatusSchema = z.object({
  id: z.string().min(1, 'Order ID is required'),
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
});

export const orderFilterSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }).optional(),
  type: z.string().optional(),
  asset: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>; 