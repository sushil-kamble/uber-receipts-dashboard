import { ServiceType, ReceiptService, ServiceRegistryInterface } from "./types";

/**
 * Central registry for all available receipt services
 */
export class ServiceRegistry implements ServiceRegistryInterface {
  private services: Map<ServiceType, ReceiptService> = new Map();

  /**
   * Register a new service
   */
  registerService(type: ServiceType, service: ReceiptService): void {
    this.services.set(type, service);
  }

  /**
   * Get a specific service by type
   */
  getService(type: ServiceType): ReceiptService | undefined {
    return this.services.get(type);
  }

  /**
   * Get all registered services
   */
  getAllServices(): ReceiptService[] {
    return Array.from(this.services.values());
  }

  /**
   * Get all available service types
   */
  getAvailableServiceTypes(): ServiceType[] {
    return Array.from(this.services.keys());
  }

  /**
   * Check if a service is registered
   */
  hasService(type: ServiceType): boolean {
    return this.services.has(type);
  }

  /**
   * Get the number of registered services
   */
  getServiceCount(): number {
    return this.services.size;
  }
}
