import { Request, Response, NextFunction } from "express";
import * as productService from "./product.service";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (req as any).validatedQuery || req.query;
    const result = await productService.getAll(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getById(req.params.id as string);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.update(req.params.id as string, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await productService.deleteProduct(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
