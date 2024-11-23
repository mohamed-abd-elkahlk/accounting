import { productSchema } from "@/lib/validation";
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
import { useCraeteNewProduct, useUpdateProductByID } from "@/api/queries";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import DialogCloseButton from "../shared/DialogCloseButton";
import { Product } from "@/types";
import { Textarea } from "../ui/textarea";
// import DialogCloseButton from "../shared/DialogCloseButton";
export default function ProductForm({
  action,
  data,
}: {
  action: string;
  data?: Product;
}) {
  const { toast } = useToast();
  const dialogRef = useRef<HTMLButtonElement | null>(null);

  const { mutateAsync: createProduct, isPending: isCreate } =
    useCraeteNewProduct();

  const { mutateAsync: updateProduct, isPending: isUpdate } =
    useUpdateProductByID(data?._id.$oid!);
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: data?.name || "",
      stock: data?.stock || 0,
      price: data?.price || 0,
      discription: data?.discription || "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (action === "update") {
      try {
        await updateProduct(values);
        if (dialogRef.current) {
          dialogRef.current.click();
        }
        form.reset();
        return toast({
          title: "Product updated successfully",
          variant: "success",
        });
      } catch (error) {
        console.log(error);
        toast({
          title: "Faild to update Product",
          variant: "destructive",
        });
      }
    } else {
      try {
        await createProduct(values);
        if (dialogRef.current) {
          dialogRef.current.click();
        }
        form.reset();
        return toast({
          title: "Product added successfully",
          variant: "success",
        });
      } catch (error) {
        console.log(error);
        toast({
          title: "Faild to add new Product",
          variant: "destructive",
        });
      }
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input placeholder="Price" type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input placeholder="Stock" type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogCloseButton
          action={action}
          pending={isUpdate || isCreate}
          ref={dialogRef}
        />
      </form>
    </Form>
  );
}
