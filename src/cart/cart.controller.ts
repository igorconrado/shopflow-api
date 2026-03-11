import { Request, Response, NextFunction } from "express";
import * as cartService from "./cart.service";

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.getCart(req.user!.userId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const cartItem = await cartService.addItem(req.user!.userId, req.body);
    res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const cartItem = await cartService.updateItem(
      req.user!.userId,
      req.params.itemId as string,
      req.body
    );
    res.json(cartItem);
  } catch (error) {
    next(error);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    await cartService.removeItem(req.user!.userId, req.params.itemId as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    await cartService.clearCart(req.user!.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
