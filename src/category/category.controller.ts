import { Request, Response, NextFunction } from "express";
import * as categoryService from "./category.service";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.getAll();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.getById(req.params.id as string);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.update(req.params.id as string, req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await categoryService.deleteCategory(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
