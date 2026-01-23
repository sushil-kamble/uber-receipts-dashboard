"use client";

import { Button } from "@/components/ui/button";
import { ActionButtonsProps } from "../types";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createReceiptFromSelection } from "@/lib/receiptUtils";

export default function ActionButtons({
  hasReceipts,
  selectedReceipts,
  receipts,
  onDelete,
}: ActionButtonsProps) {
  const hasSelection = selectedReceipts.length > 0;

  const handleDownload = () => {
    const selectedReceiptObjects = receipts.filter((receipt) =>
      selectedReceipts.includes(receipt.id)
    );

    // Count how many have PDF URLs
    const receiptWithPdfs = selectedReceiptObjects.filter(
      (receipt) => receipt.pdfUrl
    );

    if (receiptWithPdfs.length === 0) {
      toast.error("No PDF links available for selected receipts");
      return;
    }

    // Show loading toast
    toast.info(`Opening ${receiptWithPdfs.length} PDFs...`);

    // Open each PDF in a new tab
    receiptWithPdfs.forEach((receipt) => {
      if (receipt.pdfUrl) {
        window.open(receipt.pdfUrl, "_blank");
      }
    });

    toast.success(`Downloaded ${receiptWithPdfs.length} receipts`);
  };

  const handleCreateReceipt = () => {
    createReceiptFromSelection(selectedReceipts, receipts);
  };

  const handleCopy = () => {
    // Determine which receipts to copy
    const receiptsToCopy = hasSelection
      ? receipts.filter((receipt) => selectedReceipts.includes(receipt.id))
      : receipts;

    if (receiptsToCopy.length === 0) {
      toast.error("No receipts to copy");
      return;
    }

    // Create headers row
    const headers = [
      "Date",
      "Amount",
      "Pick Up Location",
      "Drop Location",
      "Pick Up Time",
      "Drop Time",
      "Email",
    ].join("\t");

    // Format each receipt as a tab-separated row
    const rows = receiptsToCopy.map((receipt) => {
      return [
        formatDate(receipt.date),
        receipt.amount,
        receipt.pickupLocation || receipt.location || "",
        receipt.dropoffLocation || "",
        receipt.pickupTime || "",
        receipt.dropoffTime || "",
        receipt.gmailUrl || "",
      ].join("\t");
    });

    // Calculate total amount
    const totalAmount = receiptsToCopy.reduce(
      (sum, receipt) => sum + receipt.amount,
      0
    );

    // Add total row
    const totalRow = ["TOTAL", totalAmount, "", "", "", "", ""].join("\t");

    // Combine headers, data rows, and total row
    const copyText = [headers, ...rows, "", totalRow].join("\n");

    // Copy to clipboard
    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        toast.success(`Copied ${receiptsToCopy.length} receipts to clipboard`);
      })
      .catch((error) => {
        console.error("Copy failed:", error);
        toast.error("Failed to copy receipts to clipboard");
      });
  };

  // If no receipts, don't show action buttons
  if (!hasReceipts) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="default"
        size="sm"
        className="flex items-center gap-1"
        disabled={!hasSelection}
        onClick={handleCreateReceipt}
      >
        <i className="bx bx-receipt text-base"></i>
        <span>
          Create Receipt {hasSelection ? `(${selectedReceipts.length})` : ""}
        </span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        disabled={!hasSelection}
        onClick={handleDownload}
      >
        <i className="bx bxs-download text-base"></i>
        <span>
          Download {hasSelection ? `(${selectedReceipts.length})` : ""}
        </span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleCopy}
      >
        <i className="bx bx-copy text-base"></i>
        <span>Copy {hasSelection ? `(${selectedReceipts.length})` : ""}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
        disabled={!hasSelection}
        onClick={onDelete}
      >
        <i className="bx bx-trash text-base"></i>
        <span>Delete {hasSelection ? `(${selectedReceipts.length})` : ""}</span>
      </Button>
    </div>
  );
}
