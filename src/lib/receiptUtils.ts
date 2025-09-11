import { Receipt } from "@/app/types";
import { toast } from "sonner";

export function createReceiptFromSelection(
  selectedReceipts: string[],
  receipts: Receipt[]
) {
  if (selectedReceipts.length === 0) {
    toast.error("Please select receipts to create a receipt");
    return;
  }

  const selectedReceiptObjects = receipts.filter((receipt) =>
    selectedReceipts.includes(receipt.id)
  );

  // Sort receipts by date in ascending order
  const sortedReceiptObjects = selectedReceiptObjects
    .slice()
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  if (selectedReceiptObjects.length === 0) {
    toast.error("No receipts selected");
    return;
  }

  // Create Excel format data
  const headers = ["Date", "Amount"].join("\t");

  // Format each receipt with date logic (if pickup after 12 AM, use previous date)
  const rows = sortedReceiptObjects.map((receipt) => {
    let receiptDate = new Date(receipt.date);

    // If pickup time is available and after midnight, use previous date
    if (receipt.pickupTime) {
      const pickupHour = parseInt(receipt.pickupTime.split(":")[0]);
      if (pickupHour >= 0 && pickupHour < 12) {
        receiptDate.setDate(receiptDate.getDate() - 1);
      }
    }

    return [new Date(receiptDate).toLocaleDateString(), receipt.amount].join(
      "\t"
    );
  });

  // Calculate total amount
  const totalAmount = sortedReceiptObjects.reduce(
    (sum, receipt) => sum + receipt.amount,
    0
  );

  // Add total row
  const totalRow = ["TOTAL", totalAmount].join("\t");

  // Combine headers, data rows, and total row
  const excelText = [headers, ...rows, "", totalRow].join("\n");

  // Copy to clipboard
  navigator.clipboard
    .writeText(excelText)
    .then(() => {
      toast.success(
        `Receipt created and copied to clipboard for ${selectedReceiptObjects.length} items`
      );
    })
    .catch((error) => {
      console.error("Copy failed:", error);
      toast.error("Failed to copy receipt to clipboard");
    });
}