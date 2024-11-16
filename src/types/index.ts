import { NewClientSchema } from "@/lib/validation";
import { z } from "zod";

export type Client = {
  id: string;
  username: string;
  email?: string | null;
  phone: number;
  companyName: string;
  city: string;
  address: string;

  // Financial fields
  invoices?: string[];
  totalOwed?: number | null;
  totalPaid?: number | null;
  outstandingBalance?: number | null;
};

export type NewClient = z.infer<typeof NewClientSchema>;
