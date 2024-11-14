import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaPlus } from "react-icons/fa";
import { ScrollArea } from "@/components/ui/scroll-area";
import InvoiceForm from "../forms/InvoiceForm";

export default function NewInvoice() {
  return (
    <Dialog>
      <DialogTrigger>
        <div className="p-6 text-center bg-blue-100 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200">
          <FaPlus className="text-4xl text-blue-600" />
          <h2 className="text-xl font-semibold mt-2 text-blue-600">
            Add New Invoice
          </h2>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Invoices</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border">
          <InvoiceForm action="create" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
