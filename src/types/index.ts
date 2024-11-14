import { UserSchema } from "@/lib/validation";
import { z } from "zod";

export type Client = z.infer<typeof UserSchema>;
