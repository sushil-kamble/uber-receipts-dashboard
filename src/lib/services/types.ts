import {
  EmailAuthConfig,
  EmailSearchResult,
  RawEmailData,
} from "../email-client/types";
import { ReceiptParsingResult } from "../receipt-parser/types";

/**
 * Interface that all receipt services must implement
 */
export interface ReceiptService {
  serviceName: string;

  /**
   * Search for receipt emails from this service
   */
  searchReceipts(
    auth: EmailAuthConfig,
    startDate: Date,
    endDate: Date,
    maxResults: number
  ): Promise<EmailSearchResult>;

  /**
   * Parse receipt data from emails
   */
  parseReceipts(emails: RawEmailData[]): Promise<ReceiptParsingResult[]>;
}

/**
 * Enum for supported service types
 */
export enum ServiceType {
  UBER = "uber",
  RAPIDO = "rapido",
}

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  name: string;
  senders: string[];
  subjects: string[];
}

/**
 * Service registry interface
 */
export interface ServiceRegistryInterface {
  registerService(type: ServiceType, service: ReceiptService): void;
  getService(type: ServiceType): ReceiptService | undefined;
  getAllServices(): ReceiptService[];
  getAvailableServiceTypes(): ServiceType[];
}
