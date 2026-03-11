import { z } from "zod";

export const AddItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

export const UpdateItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export type AddItemInput = z.infer<typeof AddItemSchema>;
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;
