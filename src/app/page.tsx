"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, SortConfig } from "./types";
import { DateRange } from "react-day-picker";
import ReceiptsTable from "./components/ReceiptsTable";
import DateRangePicker from "./components/DateRangePicker";
import ActionButtons from "./components/ActionButtons";
import DeleteConfirmationDialog from "./components/DeleteConfirmationDialog";
import GmailConnection from "./components/GmailConnection";
import ReceiptStatistics from "./components/ReceiptStatistics";
import { toast } from "sonner";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { createReceiptFromSelection } from "@/lib/receiptUtils";

export default function ReceiptsPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGmailConnected, setIsGmailConnected] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  });

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [pickupFilter, setPickupFilter] = useState<string>("");
  const [dropoffFilter, setDropoffFilter] = useState<string>("");
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: "date",
    direction: "desc",
  });

  // Handle row selection
  const handleSelectReceipt = (id: string, isSelected: boolean) => {
    setSelectedReceipts((prev) =>
      isSelected ? [...prev, id] : prev.filter((receiptId) => receiptId !== id)
    );
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    setSelectedReceipts(isSelected ? receipts.map((r) => r.id) : []);
  };

  // Handle sort
  const handleSort = (column: keyof Receipt) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        // Toggle direction if same column
        return {
          column,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      // Default to descending for new column sort
      return {
        column,
        direction: "desc",
      };
    });
  };

  // Handle delete dialog open
  const handleOpenDeleteDialog = () => {
    if (selectedReceipts.length > 0) {
      setIsDeleteDialogOpen(true);
    }
  };

  // Handle delete confirmation
  const handleDeleteReceipts = () => {
    // Client-side only implementation for now
    const remainingReceipts = receipts.filter(
      (receipt) => !selectedReceipts.includes(receipt.id)
    );

    setReceipts(remainingReceipts);
    setSelectedReceipts([]);
    setIsDeleteDialogOpen(false);

    toast.success(`Deleted ${selectedReceipts.length} receipt(s) successfully`);
  };

  const handleCreateReceipt = () => {
    createReceiptFromSelection(selectedReceipts, receipts);
  };

  // Apply client-side filtering and sorting
  const filteredAndSortedReceipts = [...receipts]
    .filter((receipt) => {
      const pickupMatch =
        !pickupFilter ||
        receipt.pickupLocation
          ?.toLowerCase()
          .includes(pickupFilter.toLowerCase()) ||
        receipt.location?.toLowerCase().includes(pickupFilter.toLowerCase());

      const dropoffMatch =
        !dropoffFilter ||
        receipt.dropoffLocation
          ?.toLowerCase()
          .includes(dropoffFilter.toLowerCase());

      return pickupMatch && dropoffMatch;
    })
    .sort((a, b) => {
      if (!sortConfig.column) return 0;

      const column = sortConfig.column;
      const direction = sortConfig.direction;

      if (column === "amount") {
        // Numeric sort for amounts
        return direction === "asc"
          ? a[column] - b[column]
          : b[column] - a[column];
      }

      // String sort for everything else
      const aValue = String(a[column]);
      const bValue = String(b[column]);

      return direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  // Check Gmail connection status on component mount
  useEffect(() => {
    async function checkGmailConnection() {
      try {
        const response = await fetch("/api/auth/gmail/status");
        const data = await response.json();

        if (data.success) {
          setIsGmailConnected(data.data.isConnected);
          // Auto-search on page load if Gmail is connected
          if (data.data.isConnected && dateRange.from && dateRange.to) {
            handleSearch();
          }
        }
      } catch (error) {
        console.error("Error checking Gmail connection:", error);
      }
    }

    checkGmailConnection();
  }, [dateRange.from, dateRange.to]);

  // Watch for Gmail connection changes and auto-search
  useEffect(() => {
    if (isGmailConnected && dateRange.from && dateRange.to) {
      handleSearch();
    }
  }, [isGmailConnected]);

  const handleSearch = async () => {
    if (!dateRange.from || !dateRange.to) {
      return;
    }

    setIsLoading(true);

    try {
      // Format dates for the API
      const startDate = dateRange.from.toISOString().split("T")[0];
      const endDate = dateRange.to.toISOString().split("T")[0];

      // Call the search API
      const response = await fetch(
        `/api/receipts/search?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setReceipts(result.data || []);
      } else {
        console.error("API error:", result.error);
        // In a real app, we would show an error toast here
        setReceipts([]);
      }
    } catch (error) {
      console.error("Error searching receipts:", error);
      // In a real app, we would show an error toast here
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <SignedOut>
        <div className="flex flex-col items-center justify-center bg-card rounded-lg shadow p-8 text-center">
          <i className="bx bxs-lock-alt text-5xl mb-4 text-muted-foreground"></i>
          <h2 className="text-2xl font-semibold mb-3">Sign in to continue</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to connect your Gmail account and view your cab
            receipts.
          </p>
          <SignInButton mode="modal">
            <Button className="flex items-center gap-2">
              <i className="bx bx-log-in"></i>
              Sign In
            </Button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        {/* Gmail Connection Section */}
        <GmailConnection onConnectionChange={setIsGmailConnected} />
        {/* Show the rest of the UI only when Gmail is connected */}
        {isGmailConnected && (
          <>
            {/* Date Range Picker Section with Filters */}
            <div className="mb-5 bg-card rounded-lg shadow p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <DateRangePicker
                    dateRange={dateRange}
                    setDateRange={(range: DateRange) => {
                      // Handle the type conversion from DateRange to our state type
                      setDateRange({
                        from: range?.from,
                        to: range?.to || undefined,
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    onClick={handleSearch}
                    disabled={!dateRange.from || !dateRange.to || isLoading}
                    className="flex items-center justify-center gap-1"
                  >
                    <i
                      className={`bx ${
                        isLoading ? "bx-loader-alt animate-spin" : "bx-search"
                      }`}
                    ></i>
                    <span>
                      {isLoading ? "Searching..." : "Search Receipts"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setDateRange({ from: undefined, to: undefined })
                    }
                    className="flex items-center justify-center gap-1"
                  >
                    <i className="bx bx-reset"></i>
                    <span>Reset</span>
                  </Button>
                </div>
              </div>

              {/* Filters Section */}
              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Filter by pickup location..."
                      value={pickupFilter}
                      onChange={(e) => setPickupFilter(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Filter by drop location..."
                      value={dropoffFilter}
                      onChange={(e) => setDropoffFilter(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPickupFilter("");
                      setDropoffFilter("");
                    }}
                    className="flex items-center justify-center gap-1 sm:w-auto w-full"
                    disabled={!pickupFilter && !dropoffFilter}
                  >
                    <i className="bx bx-x"></i>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            {(receipts.length > 0 || isLoading) && (
              <ReceiptStatistics
                receipts={filteredAndSortedReceipts}
                isLoading={isLoading}
              />
            )}

            {/* Results Table Section */}
            <div className="mb-5 bg-card rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Receipt Results</h2>
                <Button
                  className="flex items-center gap-1"
                  disabled={selectedReceipts.length === 0}
                  onClick={handleCreateReceipt}
                >
                  <i className="bx bx-receipt text-base"></i>
                  Create Receipt{" "}
                  {selectedReceipts.length > 0
                    ? `(${selectedReceipts.length})`
                    : ""}
                </Button>
              </div>
              <ReceiptsTable
                receipts={filteredAndSortedReceipts}
                isLoading={isLoading}
                selectedReceipts={selectedReceipts}
                onSelectReceipt={handleSelectReceipt}
                onSelectAll={handleSelectAll}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>

            {/* Action Buttons Section */}
            <div className="mb-5 ">
              <ActionButtons
                hasReceipts={receipts.length > 0}
                selectedReceipts={selectedReceipts}
                receipts={filteredAndSortedReceipts}
                onDelete={handleOpenDeleteDialog}
              />
            </div>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteReceipts}
          selectedCount={selectedReceipts.length}
        />
      </SignedIn>
    </div>
  );
}
