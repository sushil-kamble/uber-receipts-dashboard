import type { DateRange } from "react-day-picker";

// Receipt type definition
export interface Receipt {
  id: string;
  date: string;
  amount: number;
  location: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupTime?: string;
  dropoffTime?: string;
  pdfUrl?: string; // PDF download link from email
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
