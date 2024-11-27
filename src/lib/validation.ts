import { z } from "zod";

export const clientSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must be at most 50 characters"),

  email: z.string().email("Invalid email address").optional().or(z.literal("")),

  phone: z
    .string()
    .refine(
      (phone) => /^(?:\+20)?01\d{9}$/.test(phone),
      "Invalid Egyptian phone number"
    ),
  company_name: z
    .string()
    .min(2, "Company Name must be at least 2 characters")
    .max(50, "Company Name must be at most 50 characters"),

  city: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(50, "City name must be at most 50 characters"),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be at most 200 characters"),
});

export const invoiceSchema = z.object({
  clientId: z.string({ message: "Client required" }).min(1, "Client required"),
  goods: z.array(
    z.object({
      productId: z.string().min(1, { message: "Product is required" }),
      quantity: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z.number().min(1, "Quantity must be at least 1")
      ),
    })
  ),
});
export const productSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Item name lenght must be more than 3" })
    .max(400, { message: "Item name lenght must be less than 400" }),

  discription: z.string().optional(),
  stock: z
    .union([
      z.string().transform((val) => parseFloat(val)),
      z.number(), // Accept numbers directly
    ])
    .refine((val) => Number.isInteger(val), {
      message: "Stock must be an integer",
    })
    .refine((val) => val >= 0, {
      message: "Stock cannot be negative",
    })
    .refine((val) => val <= 100000000, {
      message: "Item in stock must be less than 100000000",
    }),

  price: z
    .union([
      z.string().transform((val) => parseFloat(val)),
      z.number(), // Accept numbers directly
    ])
    .refine((val) => !isNaN(val), {
      message: "Price must be a valid number",
    })
    .refine((val) => val >= 0, {
      message: "Price cannot be negative",
    })
    .refine((val) => val <= 100000000, {
      message: "Item price must be less than 100000000",
    }),
});
