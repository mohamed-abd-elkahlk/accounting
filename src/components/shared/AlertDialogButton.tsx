import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { useDeleteClient } from "@/api/queries";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AlertDialogButton({ clientId }: { clientId: string }) {
  const {
    mutate: deleteClinet,
    isError,
    isPending,
    isSuccess,
    data,
  } = useDeleteClient(clientId);
  const navigate = useNavigate();

  const { toast } = useToast();
  if (isError) {
    toast({ variant: "destructive", title: "Fiald to delete clinet" });
  }
  if (isSuccess) {
    toast({ variant: "success", title: data });
    navigate(-1);
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant={"destructive"}>Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete client
            and remove his data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteClinet()}
            disabled={isPending}
          >
            {isPending ? "Deleteing..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
