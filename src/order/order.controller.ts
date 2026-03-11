import { Request, Response, NextFunction } from "express";
import * as orderService from "./order.service";

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.createOrder(req.user!.userId);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getOrders(req.user!.userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(
      req.user!.userId,
      req.params.id as string
    );
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id as string,
      req.body
    );
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.cancelOrder(
      req.user!.userId,
      req.params.id as string
    );
    res.json(order);
  } catch (error) {
    next(error);
  }
}
