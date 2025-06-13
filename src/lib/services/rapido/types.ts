import { ParsedReceipt } from "../../receipt-parser/types";

/**
 * Rapido-specific receipt data structure
 */
export interface RapidoReceiptData extends ParsedReceipt {
  rideId: string;
  customerName?: string;
  driverName?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  timeOfRide?: string;
  pickupTime?: string;
}

/**
 * Rapido HTML parsing patterns
 */
export interface RapidoParsingPatterns {
  customerName: RegExp[];
  rideId: RegExp[];
  driverName: RegExp[];
  vehicleNumber: RegExp[];
  vehicleType: RegExp[];
  timeOfRide: RegExp[];
  amount: RegExp[];
  pickupLocation: RegExp[];
  dropoffLocation: RegExp[];
}
