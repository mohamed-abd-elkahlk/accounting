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
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AlertDialogButton({
  onClick,
  whatToDelete,
  isError,
  isSuccess,
  isPending,
  data,
}: {
  onClick: () => void;
  whatToDelete: string;
  isError: boolean;
  isSuccess: boolean;
  isPending: boolean;
  data: string;
}) {
  const navigate = useNavigate();

  const { toast } = useToast();
  if (isError) {
    toast({ variant: "destructive", title: `Fiald to delete ${whatToDelete}` });
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
            This action cannot be undone. This will permanently delete{" "}
            {whatToDelete} and remove his data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClick} disabled={isPending}>
            {isPending ? "Deleteing..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
