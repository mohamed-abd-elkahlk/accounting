import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { forwardRef, ForwardedRef } from "react";

// Forward the ref so it can be used to trigger the click event
const DialogCloseButton = forwardRef(
  (
    { action, pending }: { action: string; pending: boolean },
    ref: ForwardedRef<HTMLButtonElement>
  ) => (
    <div className="flex justify-end gap-3">
      <DialogFooter>
        <Button type="submit">
          {pending ? "Loading..." : action === "create" ? "Confirm" : "Update"}
        </Button>
      </DialogFooter>
      <DialogClose asChild>
        <Button type="button" variant="secondary" ref={ref}>
          Close
        </Button>
      </DialogClose>
    </div>
  )
);

DialogCloseButton.displayName = "DialogCloseButton"; // Add display name for better debugging
export default DialogCloseButton;
