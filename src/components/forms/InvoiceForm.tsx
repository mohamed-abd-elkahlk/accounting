import { invoiceSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DialogCloseButton from "../shared/DialogCloseButton";
import {
  useGetClinets,
  useGetProducts,
  useCreateNewInvoice,
} from "@/api/queries";
import { Button } from "../ui/button";
import Spinner from "../shared/Spiner";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { QueryError } from "../shared/ErrorResponsePage";
export default function InvoiceForm({ action }: { action: string }) {
  const dialogRef = useRef<HTMLButtonElement | null>(null);

  const {
    data: clinets = [],
    isPending: isClientsPending,
    error: clientsError,
  } = useGetClinets();

  const {
    data: products = [],
    isPending: isProductsPending,
    error: productsError,
  } = useGetProducts();

  const {
    mutateAsync: createInvoice,
    isPending: isInvoicePending,
    error: invoiceError,
  } = useCreateNewInvoice();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "",
      goods: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goods",
  });

  async function onSubmit(values: z.infer<typeof invoiceSchema>) {
    console.log(values);

    try {
      await createInvoice(values);
      toast({
        title: "Invoice created successfully!",
        variant: "success",
      });
      console.log("Invoice successfully created:", values);
    } catch (error) {
      if (error instanceof QueryError) {
        // Handle QueryError specifically
        toast({
          title: `Error: ${error.message}`,
          description:
            error.details || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to create invoice.",
          description: "Please try again.",
          variant: "destructive",
        });
        console.error("Failed to create invoice:", error);
      }
    }
  }

  useEffect(() => {
    if (clientsError || productsError) {
      toast({
        title: "Failed to load clients or products.",
        variant: "destructive",
      });
      dialogRef.current?.click();
    }
  }, [clientsError, productsError, toast]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-8 bg-white shadow-md rounded-lg p-6"
      >
        {/* Loading States */}
        {isClientsPending && <Spinner />}
        {isProductsPending && <Spinner />}

        {/* Client Selection */}
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Client</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clinets.map((client) => (
                    <SelectItem key={client._id.$oid} value={client._id.$oid}>
                      {client.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Products</h3>
            <Button
              type="button"
              onClick={() => append({ productId: "", quantity: 1 })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Add Product
            </Button>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg shadow-sm"
            >
              {/* Product Dropdown */}
              <FormField
                control={form.control}
                name={`goods.${index}.productId`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem
                            key={product._id.$oid}
                            value={product._id.$oid}
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
              <FormField
                control={form.control}
                name={`goods.${index}.quantity`}
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter quantity"
                        {...field}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remove Button */}
              <Button
                variant="secondary"
                onClick={() => remove(index)}
                className="bg-red-100 mt-auto text-red-600 px-3 py-1 rounded hover:bg-red-200"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        {/* Submit and Close Buttons */}
        <DialogCloseButton
          action={action}
          pending={isInvoicePending}
          ref={dialogRef}
        />
      </form>
    </Form>
  );
}
