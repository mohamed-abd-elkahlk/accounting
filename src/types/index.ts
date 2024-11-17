import { NewClientSchema } from "@/lib/validation";
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
  created_at: string;
  updated_at: string;
};

export type NewClient = z.infer<typeof NewClientSchema>;
