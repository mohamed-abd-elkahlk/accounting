import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";
import { Invoice } from "@/types";
import InvoiceForm from "../forms/InvoiceForm";

export default function InvoiceUpdate({ invoice }: { invoice: Invoice }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-700">Update</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Invoice</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border">
          <InvoiceForm action="update" data={invoice} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
