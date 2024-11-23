import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";
import { Product } from "@/types";
import ProductForm from "../forms/ItemsForm";

export default function UpdateProduct({ product }: { product: Product }) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="bg-green-500 hover:bg-green-700">Update</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Prodcut</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border">
          <ProductForm action="update" data={product} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
