import { productSchema, clientSchema } from "@/lib/validation";
import { z } from "zod";

export type Client = {
  _id: { $oid: string };
  username: string;
  email?: string | null;
  phone: string;
  company_name: string;
  city: string;
  address: string;
  profilePic?: string | null;
  // Financial fields
  invoices?: string[];
  totalOwed?: number | null;
  totalPaid?: number | null;
  outstandingBalance?: number | null;
  // dates
  created_at: { $date: { $numberLong: string } };
  updated_at: { $date: { $numberLong: string } };
};
export type Product = {
  _id: { $oid: string };
  name: string;
  discription?: string | null;
  tags: string[];
  price: number;
  stock: number;
  // dates
  created_at: { $date: { $numberLong: string } };
  updated_at: { $date: { $numberLong: string } };
};

export type NewClient = z.infer<typeof clientSchema>;

export type NewProduct = z.infer<typeof productSchema>;
