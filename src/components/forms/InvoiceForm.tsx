import { invoiceSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
  useUpdateInvoiceByID,
} from "@/api/queries";
import { Button } from "../ui/button";
import Spinner from "../shared/Spiner";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { QueryError } from "../shared/ErrorResponsePage";
import { Invoice, NewInvoice } from "@/types";

export default function InvoiceForm({
  action,
  data,
}: {
  action: string;
  data?: Invoice;
}) {
  const [totalPrice, setTotalPrice] = useState(0);
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

  const { mutateAsync: updateInvoice } = useUpdateInvoiceByID(data?._id.$oid!);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: data?.clientId.$oid || "",
      goods: data?.goods?.map((item) => ({
        name: item.name || "",
        price: item.price || 0.0,
        quantity: item.quantity || 1, // Default quantity
        productId: item.productId.$oid || "",
      })) || [
        {
          name: "",
          price: 0.0,
          quantity: 1, // Default quantity
          productId: "",
        },
      ],
      totalPaid: data?.totalPaid || 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goods",
  });

  const goods = useWatch({
    control: form.control,
    name: "goods",
  });

  const totalPaid = useWatch({
    control: form.control,
    name: "totalPaid", // Watch totalPaid value from the form state
  });
  useEffect(() => {
    goods.forEach((item, index) => {
      if (item.productId && item.productId !== "") {
        const selectedProduct = products.find(
          (product) => product._id.$oid === item.productId
        );
        if (
          selectedProduct &&
          (form.getValues(`goods.${index}.name`) !== selectedProduct.name ||
            form.getValues(`goods.${index}.price`) !== selectedProduct.price)
        ) {
          // Only update if values are different
          form.setValue(`goods.${index}.name`, selectedProduct.name, {
            shouldDirty: true,
          });
          form.setValue(`goods.${index}.price`, selectedProduct.price, {
            shouldDirty: true,
          });
        }
      }
    });
  }, [goods, products, form]);

  // Recalculate total price whenever "goods" changes
  useEffect(() => {
    const sumTotalPrice = () => {
      if (!products || goods.length === 0) {
        setTotalPrice(0);
        return;
      }

      const total = goods.reduce((sum, item) => {
        const product = products.find(
          (product) => product._id.$oid === item.productId
        );
        const productPrice = product?.price || item.price || 0;
        const quantity = item.quantity || 1; // Default to 1 if undefined

        return sum + productPrice * quantity;
      }, 0);

      setTotalPrice(total);
    };

    sumTotalPrice();
  }, [goods, products]);

  async function onSubmit(values: z.infer<typeof invoiceSchema>) {
    if (action === "create") {
      try {
        await createInvoice(values);
        toast({
          title: "Invoice created successfully!",
          variant: "success",
        });
      } catch (error) {
        if (error instanceof QueryError) {
          toast({
            title: `Error: ${error.message}`,
            description:
              error.details ||
              "An unexpected error occurred. Please try again.",
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
    } else {
      try {
        console.log({ values });

        await updateInvoice(values);
        toast({
          title: "Invoice updated successfully!",
          variant: "success",
        });
      } catch (error) {
        if (error instanceof QueryError) {
          toast({
            title: error.message || "Failed to update invoice.",
            description: error.details || "Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Failed to update invoice.",
            description: "Please try again.",
            variant: "destructive",
          });
        }
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedProduct = products.find(
                          (p) => p._id.$oid === value
                        );
                        if (selectedProduct) {
                          form.setValue(
                            `goods.${index}.name`,
                            selectedProduct.name
                          );
                          form.setValue(
                            `goods.${index}.price`,
                            selectedProduct.price
                          );
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            {field.value
                              ? products.find((p) => p._id.$oid === field.value)
                                  ?.name || "Select a product"
                              : "Select a product"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem
                            key={product._id.$oid}
                            value={product._id.$oid}
                          >
                            {product.name || "Unnamed Product"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity Field */}
              <FormField
                control={form.control}
                name={`goods.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        value={field.value || 1} // Default to 1 if not set
                      />
                    </FormControl>
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
          <Button
            type="button"
            onClick={() =>
              append({
                productId: "", // Initially empty product ID
                name: "", // Default empty name
                price: 0, // Default price (could be updated when selecting product)
                quantity: 1, // Default quantity
              })
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Product
          </Button>
        </div>

        {/* Total Paid */}
        <FormField
          control={form.control}
          name={`totalPaid`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Total Paid</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit and Close Buttons */}
        <DialogCloseButton
          action={action}
          pending={isInvoicePending}
          ref={dialogRef}
        />
      </form>

      <div className="text-left font-bold text-lg mt-4">
        <p>Total Price: ${totalPrice.toFixed(2)}</p>
      </div>
    </Form>
  );
}
