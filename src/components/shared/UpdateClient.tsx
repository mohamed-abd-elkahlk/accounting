import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ClientForm from "../forms/ClientForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";
import { Client } from "@/types";

export default function UpdateClient({ client }: { client: Client }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-700">Update</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Client</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border">
          <ClientForm action="update" data={client} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
