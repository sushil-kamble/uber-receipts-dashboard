import type { DateRange } from "react-day-picker";

// Receipt type definition
export interface Receipt {
  id: string;
  date: string;
  amount: number;
  currency?: string; // NEW: Support multiple currencies
  location: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupTime?: string;
  dropoffTime?: string;
  pdfUrl?: string; // PDF download link from email
  gmailUrl?: string; // Direct link to view the email in Gmail
  service: string; // NEW: Which service (Uber, Rapido, etc.)
  serviceId?: string; // NEW: Service-specific ID (tripId, rideId)
  driverName?: string; // NEW: Driver information
  vehicleInfo?: string; // NEW: Vehicle number/type
}

// Props for DateRangePicker component
export interface DateRangePickerProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

// Sorting configuration
export interface SortConfig {
  column: keyof Receipt | null;
  direction: "asc" | "desc";
}

// Props for ReceiptsTable component
export interface ReceiptsTableProps {
  receipts: Receipt[];
  isLoading: boolean;
  selectedReceipts: string[];
  onSelectReceipt: (id: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  sortConfig?: SortConfig;
  onSort: (column: keyof Receipt) => void;
}

// Props for ActionButtons component
export interface ActionButtonsProps {
  hasReceipts: boolean;
  selectedReceipts: string[];
  receipts: Receipt[];
  onDelete: () => void;
}

// Props for DeleteConfirmationDialog component
export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
}

// API response types
export interface ReceiptsApiResponse {
  success: boolean;
  message?: string;
  data?: Receipt[];
  error?: string;
}
