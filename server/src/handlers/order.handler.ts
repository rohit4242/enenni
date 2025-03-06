import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { OrderStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import type { OrderFilterInput } from "../schemas/order.schema";
// Create a new order
export const createOrder = async (c: Context) => {
  const user = c.get("user");
  // const { type, asset, quantity, pricePerToken, totalAmount, currency, referenceId } = await c.req.json();

  const data = await c.req.json();
  // Create the order with the provided data
  const order = await prisma.order.create({
    data: {
      ...data,
      userId: user.id,
      status: OrderStatus.PENDING,
    },
  });

  return c.json(
    {
      success: true,
      message: "Order created successfully",
      order,
    },
    201
  );
};

// Get all orders for the authenticated user
export const getUserOrders = async (c: Context) => {
  const user = c.get("user");
  const {
    status,
    type,
    asset,
    startDate,
    endDate,
    page = "1",
    limit = "10",
    search,
  } = c.req.query();

  // Build where conditions based on filters
  const where: any = {
    userId: user.id,
  };

  if (status) where.status = status;
  if (type) where.type = type;
  if (asset) where.asset = asset;

  if (startDate) {
    where.createdAt = {
      ...(where.createdAt || {}),
      gte: new Date(startDate),
    };
  }

  if (endDate) {
    where.createdAt = {
      ...(where.createdAt || {}),
      lte: new Date(endDate),
    };
  }

  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { asset: { contains: search, mode: "insensitive" } },
      { type: { contains: search, mode: "insensitive" } },
    ];
  }

  // Parse pagination parameters
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  try {
    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return c.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new HTTPException(500, { message: "Failed to fetch orders" });
  }
};

// Get a specific order by ID
export const getOrderById = async (c: Context) => {
  const userId = c.get("userId");
  const isAdmin = c.get("isAdmin");
  const orderId = c.req.param("id");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new HTTPException(404, { message: "Order not found" });
  }

  // Check if the order belongs to the user or if the user is an admin
  if (order.userId !== userId && !isAdmin) {
    throw new HTTPException(403, {
      message: "You do not have permission to access this order",
    });
  }

  return c.json({
    success: true,
    order,
  });
};

// Update order status
export const updateOrderStatus = async (c: Context) => {
  const isAdmin = c.get("isAdmin");
  const { id, status } = await c.req.json();

  // Only admins can update order status
  if (!isAdmin) {
    throw new HTTPException(403, {
      message: "Only administrators can update order status",
    });
  }

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    throw new HTTPException(404, { message: "Order not found" });
  }

  // Don't allow updating completed orders to pending
  if (
    order.status === OrderStatus.COMPLETED &&
    status === OrderStatus.PENDING
  ) {
    throw new HTTPException(400, {
      message: "Cannot change completed orders back to pending",
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status },
  });

  return c.json({
    success: true,
    message: "Order status updated successfully",
    order: updatedOrder,
  });
};

// Cancel an order (user can only cancel their own pending orders)
export const cancelOrder = async (c: Context) => {
  const userId = c.get("userId");
  const orderId = c.req.param("id");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new HTTPException(404, { message: "Order not found" });
  }

  // Check if the order belongs to the user
  if (order.userId !== userId) {
    throw new HTTPException(403, {
      message: "You do not have permission to cancel this order",
    });
  }

  // Check if the order is already completed
  if (order.status === OrderStatus.COMPLETED) {
    throw new HTTPException(400, {
      message: "Cannot cancel a completed order",
    });
  }

  // Check if the order is already cancelled
  if (order.status === OrderStatus.CANCELLED) {
    throw new HTTPException(400, { message: "Order is already cancelled" });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELLED },
  });

  return c.json({
    success: true,
    message: "Order cancelled successfully",
    order: updatedOrder,
  });
};

// Admin: Get all orders (with optional filters)
export const getAllOrders = async (c: Context) => {
  const {
    status,
    type,
    asset,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = (await c.req.json()) as OrderFilterInput;

  // Build where conditions based on filters
  const where = {
    ...(status && { status }),
    ...(type && { type }),
    ...(asset && { asset }),
    ...(startDate && { createdAt: { gte: startDate } }),
    ...(endDate && {
      createdAt: {
        ...(startDate ? { gte: startDate } : {}),
        lte: endDate,
      },
    }),
  };

  // Get total count for pagination
  const total = await prisma.order.count({ where });

  // Get orders with pagination
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    data: {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};
