import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as orderHandler from '../handlers/order.handler';
import { 
  createOrderSchema, 
  updateOrderStatusSchema,
  orderFilterSchema
} from '../schemas/order.schema';
import { authenticate, requireAdmin } from '../middleware/auth';

const orderRouter = new Hono();

// All routes require authentication
orderRouter.use('/*', authenticate);

// User routes
orderRouter.get('/', zValidator('query', orderFilterSchema), orderHandler.getUserOrders);
orderRouter.get('/:id', orderHandler.getOrderById);
orderRouter.post('/', zValidator('json', createOrderSchema), orderHandler.createOrder);
orderRouter.put('/:id/cancel', orderHandler.cancelOrder);

// Admin routes
orderRouter.get('/admin/all', requireAdmin, zValidator('query', orderFilterSchema), orderHandler.getAllOrders);
orderRouter.put('/admin/status', requireAdmin, zValidator('json', updateOrderStatusSchema), orderHandler.updateOrderStatus);

export default orderRouter;
