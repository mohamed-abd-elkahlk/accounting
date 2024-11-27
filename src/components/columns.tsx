import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client, Invoice, Product } from "@/types";
import { useNavigate } from "react-router-dom";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const productColumns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "stock",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("stock"));
      return <div className="text-right font-medium">{amount}</div>;
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Prise</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;
      let navigate = useNavigate();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment._id.$oid)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`${payment._id.$oid}`)}>
              View Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "_id",
    header: () => <div>ID</div>,
    cell: ({ row }) => (
      <span>{row.original._id.$oid}</span> // Render the ObjectId string
    ),
  },
  {
    accessorKey: "client",
    header: () => <div>Client</div>,
    cell: ({ row }) => (
      <div>
        <p className="font-semibold">{row.original.client.username}</p>
        <p className="text-sm text-muted-foreground">
          {row.original.client.email}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "goods",
    header: () => <div>Goods</div>,
    cell: ({ row }) => (
      <ul className="list-disc pl-5">
        {row.original.goods.map((product, index) => (
          <li key={index}>
            {product._id.$oid} (x{product.stock})
          </li>
        ))}
      </ul>
    ),
  },
  {
    accessorKey: "created_at",
    header: () => <div>Created At</div>,
    cell: ({ row }) => {
      const date = new Date(
        parseInt(row.original.created_at.$date.$numberLong, 10)
      );
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "updated_at",
    header: () => <div>Updated At</div>,
    cell: ({ row }) => {
      const date = new Date(
        parseInt(row.original.updated_at.$date.$numberLong, 10)
      );
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
];
