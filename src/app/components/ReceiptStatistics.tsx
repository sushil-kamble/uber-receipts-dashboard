import { formatCurrency } from "@/lib/utils";
import { Receipt } from "../types";
import { useMemo } from "react";

export interface ReceiptStatisticsProps {
  receipts: Receipt[];
  isLoading?: boolean;
}

export default function ReceiptStatistics({
  receipts,
  isLoading = false,
}: ReceiptStatisticsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    if (!receipts.length) return null;

    const totalTrips = receipts.length;
    const totalAmount = receipts.reduce(
      (sum, receipt) => sum + receipt.amount,
      0
    );
    const avgAmount = totalAmount / totalTrips;

    // Find date range of trips in the data
    const sortedByDate = [...receipts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const earliestTrip = sortedByDate[0]?.date;
    const latestTrip = sortedByDate[sortedByDate.length - 1]?.date;

    return {
      totalTrips,
      totalAmount,
      avgAmount,
      earliestTrip,
      latestTrip,
    };
  }, [receipts]);

  // Loading state UI with skeleton loader
  if (isLoading) {
    return (
      <div className="mb-5 bg-card rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Receipt Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-background rounded-md p-3 border animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                  <div className="h-8 w-32 bg-muted rounded"></div>
                </div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1">
          <div className="h-3 w-48 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mb-5 bg-card rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Receipt Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background rounded-md p-3 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Trips</p>
              <h3 className="text-2xl font-bold">{stats.totalTrips}</h3>
            </div>
            <div className="text-primary">
              <i className="bx bx-trip text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-md p-3 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(stats.totalAmount)}
              </h3>
            </div>
            <div className="text-primary">
              <i className="bx bx-dollar-circle text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-md p-3 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Amount</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(stats.avgAmount)}
              </h3>
            </div>
            <div className="text-primary">
              <i className="bx bx-line-chart text-3xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-1 text-xs text-muted-foreground">
        <p>
          Date Range: {new Date(stats.earliestTrip).toLocaleDateString()} -{" "}
          {new Date(stats.latestTrip).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
