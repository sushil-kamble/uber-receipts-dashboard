"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Receipt, ReceiptsTableProps, SortConfig } from "../types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ReceiptsTable({
  receipts,
  isLoading,
  selectedReceipts,
  onSelectReceipt,
  onSelectAll,
  sortConfig = { column: null, direction: "asc" },
  onSort,
}: ReceiptsTableProps) {
  // Function to trim text to 80 characters
  const trimText = (
    text: string | undefined,
    maxLength: number = 34
  ): string => {
    if (!text) return "";
    const mobileMaxLength = window.innerWidth < 640 ? 20 : maxLength;
    return text.length > mobileMaxLength
      ? `${text.substring(0, mobileMaxLength)}...`
      : text;
  };

  // Enhanced columns with sorting capability
  const columns = [
    { key: "date" as keyof Receipt, name: "Date", sortable: true },
    { key: "amount" as keyof Receipt, name: "Amount", sortable: true },
    {
      key: "pickupLocation" as keyof Receipt,
      name: "Pick Up Location",
      sortable: true,
    },
    {
      key: "dropoffLocation" as keyof Receipt,
      name: "Drop Location",
      sortable: true,
    },
    {
      key: "pickupTime" as keyof Receipt,
      name: "Pick Up Time",
      sortable: true,
    },
    { key: "dropoffTime" as keyof Receipt, name: "Drop Time", sortable: true },
  ];

  // Handle column header click for sorting
  const handleSortClick = (column: keyof Receipt) => {
    onSort(column);
  };

  // Get sort direction indicator
  const getSortDirectionIcon = (column: keyof Receipt) => {
    if (sortConfig.column !== column) return null;

    return sortConfig.direction === "asc" ? (
      <i className="bx bx-up-arrow-alt ml-2"></i>
    ) : (
      <i className="bx bx-down-arrow-alt ml-2"></i>
    );
  };

  // Check if all visible receipts are selected
  const allSelected =
    receipts.length > 0 && selectedReceipts.length === receipts.length;

  // Handle select all toggle
  const handleSelectAllToggle = () => {
    onSelectAll(!allSelected);
  };

  // Handle individual receipt download
  const handleDownload = (receipt: Receipt) => {
    console.log("PDF URL:", receipt.pdfUrl);
    if (receipt.pdfUrl) {
      window.open(receipt.pdfUrl, "_blank");
    } else {
      toast.error("No PDF available for this receipt");
    }
  };

  // Loading state UI with skeleton loader
  if (isLoading) {
    return (
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                </TableHead>
                {columns.map((column) => (
                  <TableHead key={column.key}>
                    <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                  </TableHead>
                ))}
                <TableHead className="text-right">
                  <div className="h-4 bg-muted rounded animate-pulse w-20 ml-auto"></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-24 bg-muted rounded animate-pulse ml-auto"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Empty state UI
  if (!receipts.length) {
    return (
      <div className="text-center py-10 px-6">
        <div className="flex flex-col items-center gap-2">
          <i className="bx bx-file text-4xl text-muted-foreground"></i>
          <h3 className="text-lg font-medium">No receipts found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try selecting a different date range or check that your email
            account is properly connected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-full inline-block align-middle px-4 sm:px-0">
        <Table className="min-w-full divide-y divide-border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="h-5 w-5 cursor-pointer touch-manipulation"
                  checked={allSelected}
                  onChange={handleSelectAllToggle}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={
                    column.sortable ? "cursor-pointer select-none" : ""
                  }
                  onClick={
                    column.sortable
                      ? () => handleSortClick(column.key)
                      : undefined
                  }
                >
                  <div className="flex items-center">
                    {column.name}
                    {column.sortable && getSortDirectionIcon(column.key)}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => {
              const isSelected = selectedReceipts.includes(receipt.id);

              return (
                <TableRow
                  key={receipt.id}
                  className={cn(isSelected ? "bg-muted" : "")}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-5 w-5 cursor-pointer touch-manipulation"
                      checked={isSelected}
                      onChange={(e) =>
                        onSelectReceipt(receipt.id, e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(receipt.date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatCurrency(receipt.amount)}
                  </TableCell>
                  <TableCell title={receipt.pickupLocation || receipt.location}>
                    {trimText(receipt.pickupLocation || receipt.location)}
                  </TableCell>
                  <TableCell title={receipt.dropoffLocation || ""}>
                    {trimText(receipt.dropoffLocation)}
                  </TableCell>
                  <TableCell>{receipt.pickupTime || ""}</TableCell>
                  <TableCell>{receipt.dropoffTime || ""}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 py-2 min-w-[100px]"
                      onClick={() => handleDownload(receipt)}
                    >
                      <i className="bx bxs-download mr-1"></i>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
