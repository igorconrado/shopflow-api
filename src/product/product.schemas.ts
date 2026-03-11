import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(0, "Quantity must be at least 0"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().uuid("Invalid category ID"),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive").optional(),
  quantity: z.number().int().min(0, "Quantity must be at least 0").optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().uuid("Invalid category ID").optional(),
});

export const ProductQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
  search: z.string().optional(),
  page: z.string().default("1").transform(Number).pipe(z.number().int().positive()),
  limit: z.string().default("20").transform(Number).pipe(z.number().int().positive().max(100)),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;
