"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialogProps } from "../types";

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete {selectedCount} Receipt{selectedCount !== 1 ? "s" : ""}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            {selectedCount !== 1 ? "these receipts" : "this receipt"}? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            <i className="bx bx-trash"></i>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
