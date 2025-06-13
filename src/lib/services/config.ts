import { ServiceType, ServiceConfig } from "./types";

/**
 * Configuration for each supported service
 */
export const SERVICE_CONFIG: Record<ServiceType, ServiceConfig> = {
  [ServiceType.UBER]: {
    name: "Uber",
    senders: [
      "receipts@uber.com",
      "uber.receipts@uber.com",
      "noreply@uber.com",
    ],
    subjects: ["trip with Uber", "Your Uber Receipt", "Thanks for riding"],
  },
  [ServiceType.RAPIDO]: {
    name: "Rapido",
    senders: ["shoutout@rapido.bike"],
    subjects: ["Your trip with Rapido"],
  },
};
