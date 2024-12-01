import {
  productSchema,
  clientSchema,
  invoiceSchema,
  goodsSchema,
} from "@/lib/validation";
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
  status: "InActive" | "Active";
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
export type Goods = {
  name: string;
  price: number;
  quantity: number;
  productId: { $oid: string }; // this should match the _id of a Product
};

export type Invoice = {
  _id: { $oid: string };
  clientId: { $oid: string };
  goods: Goods[];
  totalPrice: number;
  totalPaid: number;
  status: "Paid" | "UnPaid" | "PartialPaid";
  // dates
  created_at?: { $date: { $numberLong: string } };
  updated_at?: { $date: { $numberLong: string } };
};
export type NewInvoice = z.infer<typeof invoiceSchema>;

export type NewClient = z.infer<typeof clientSchema>;

export type NewProduct = z.infer<typeof productSchema>;
