import { NewClientSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { useCreateNewClient } from "@/api/queries";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

import DialogCloseButton from "../shared/DialogCloseButton";
export default function ClientForm({ action }: { action: string }) {
  const { mutateAsync: createClinet, isPending: isCreatingClient } =
    useCreateNewClient();
  const { toast } = useToast();
  const dialogRef = useRef<HTMLButtonElement | null>(null); // Ensure the ref type matches the button element
  const form = useForm<z.infer<typeof NewClientSchema>>({
    resolver: zodResolver(NewClientSchema),
    defaultValues: {
      username: "",
      address: "",
      city: "",
      company_name: "",
      email: "",
      phone: 0,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof NewClientSchema>) {
    try {
      await createClinet(values);

      if (dialogRef.current) {
        dialogRef.current.click();
      }
      form.reset();
      return toast({
        title: "Client added successfully",
      });
    } catch (error) {
      toast({
        title: "Faild to add new client",
        variant: "destructive",
      });
      console.log(error);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="phone number" type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Company Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />{" "}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogCloseButton
          action="create"
          pending={isCreatingClient}
          ref={dialogRef}
        />
      </form>
    </Form>
  );
}
