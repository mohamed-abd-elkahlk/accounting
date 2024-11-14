import { z } from "zod";

export const UserSchema = z.object({
  username: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .refine(
      (phone) => /^(?:\+20)?01\d{9}$/.test(phone),
      "Invalid Egyptian phone number"
    ),
  companyName: z
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

export const newInvoiceSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be at most 50 characters" }),

  email: z.string().email({ message: "Invalid email address" }).optional(),

  phone: z.string().refine((phone) => /^(?:\+20)?01\d{9}$/.test(phone), {
    message: "Invalid Egyptian phone number",
  }),

  companyName: z
    .string()
    .min(2, { message: "Company Name must be at least 2 characters" })
    .max(50, { message: "Company Name must be at most 50 characters" }),

  city: z
    .string()
    .min(2, { message: "City name must be at least 2 characters" })
    .max(50, { message: "City name must be at most 50 characters" }),

  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(200, { message: "Address must be at most 200 characters" }),

  goods: z
    .array(
      z.object({
        itemName: z
          .string()
          .min(1, { message: "Item name must be provided" })
          .max(100, { message: "Item name must be at most 100 characters" }),

        quantity: z
          .number()
          .min(1, { message: "Quantity must be at least 1" })
          .max(1000, { message: "Quantity must be realistic (1-1000)" }),

        price: z
          .number()
          .min(0, { message: "Price cannot be negative" })
          .max(1_000_000, {
            message: "Price must be realistic (up to 1,000,000)",
          }),
      })
    )
    .min(1, { message: "At least one item must be listed in the goods" }),

  totalAmountDue: z
    .number()
    .min(0, { message: "Total amount due cannot be negative" })
    .max(1_000_000, {
      message: "Total amount due must be realistic (up to 1,000,000)",
    }),
});

export const itemSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Item name lenght must be more than 3" })
    .max(400, { message: "Item name lenght must be less than 400" }),
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val <= 100000000, {
      message: "Item in stock must be less than 100000000",
    }),
  price: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val <= 100000000, {
      message: "Item price must be less than 100000000",
    }),
});
