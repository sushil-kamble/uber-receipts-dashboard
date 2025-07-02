# Implementation Plan: Adding Rapido Service and Multi-Service Architecture

## Overview

This plan outlines the implementation of adding Rapido receipt service alongside the existing Cab service, while refactoring the codebase to support an extensible multi-service architecture for easy addition of new receipt services in the future.

## Current Architecture Analysis

### Existing Structure:
- **API Route**: `src/app/api/receipts/search/route.ts` - Main search endpoint
- **Email Client**: `src/lib/email-client/` - Gmail API integration
- **Receipt Parser**: `src/lib/receipt-parser/` - Uber-specific parsing logic
- **Types**: `src/app/types.ts` and `src/lib/receipt-parser/types.ts`

### Current Flow:
1. API receives search request with date range
2. `searchUberReceipts()` searches Gmail for Uber emails
3. `parseReceipts()` parses Uber email HTML to extract receipt data
4. Results are transformed to `Receipt[]` interface and returned

## Proposed Architecture Changes

### 1. Service-Based Architecture

#### 1.1 Create Service Interface
- **File**: `src/lib/services/types.ts`
- **Purpose**: Define common interface for all receipt services

```typescript
export interface ReceiptService {
  serviceName: string;
  searchReceipts(
    auth: EmailAuthConfig,
    startDate: Date,
    endDate: Date,
    maxResults: number
  ): Promise<EmailSearchResult>;
  parseReceipts(emails: RawEmailData[]): Promise<ReceiptParsingResult[]>;
}

export enum ServiceType {
  UBER = 'uber',
  RAPIDO = 'rapido'
}
```

#### 1.2 Service Registry
- **File**: `src/lib/services/registry.ts`
- **Purpose**: Central registry for all available services

```typescript
export class ServiceRegistry {
  private services: Map<ServiceType, ReceiptService>;
  
  registerService(type: ServiceType, service: ReceiptService): void;
  getService(type: ServiceType): ReceiptService | undefined;
  getAllServices(): ReceiptService[];
  getAvailableServiceTypes(): ServiceType[];
}
```

### 2. Uber Service Refactoring

#### 2.1 Create Uber Service Class
- **File**: `src/lib/services/uber/UberService.ts`
- **Purpose**: Encapsulate all Uber-specific logic

```typescript
export class UberService implements ReceiptService {
  serviceName = 'Uber';
  
  async searchReceipts(auth, startDate, endDate, maxResults): Promise<EmailSearchResult>;
  async parseReceipts(emails): Promise<ReceiptParsingResult[]>;
}
```

#### 2.2 Move Uber-Specific Files
- Move `src/lib/email-client/email-query-builder.ts` → `src/lib/services/uber/email-query-builder.ts`
- Rename to `buildUberReceiptQuery()` → `buildEmailQuery()`
- Move `src/lib/receipt-parser/` → `src/lib/services/uber/parser/`
- Update imports accordingly

### 3. Rapido Service Implementation

#### 3.1 Rapido Email Configuration
- **Sender**: `shoutout@rapido.bike`
- **Subject**: `Your trip with Rapido`

#### 3.2 Create Rapido Service Structure
```
src/lib/services/rapido/
├── RapidoService.ts           # Main service class
├── email-query-builder.ts     # Rapido email search queries
├── parser/
│   ├── index.ts              # Main parser exports
│   ├── types.ts              # Rapido-specific types
│   ├── parser.ts             # Main parser class
│   ├── html-parser.ts        # HTML parsing logic
│   └── pdf-parser.ts         # PDF parsing (if needed)
```

#### 3.3 Rapido HTML Parser Logic
Based on the provided HTML structure, extract:
- **Customer Name**: `Sushil Kamble`
- **Ride ID**: `RD17498376099484234`
- **Driver Name**: `Dattatray`
- **Vehicle Number**: `MH05FJ4903`
- **Vehicle Type**: `Car`
- **Time**: `Jun 14th 2025, 11:50 PM`
- **Amount**: `₹ 427`
- **Pickup Location**: `1, Millenium Business Park, MIDC Industrial Area, Mahape...`
- **Dropoff Location**: `Dream Heritage, 120,121, Sector 19, Ulwe, Navi Mumbai...`

#### 3.4 Rapido Parser Implementation Patterns
```typescript
// In RapidoHtmlParser.ts
private extractAmount(html: string): number {
  const amountPatterns = [
    /Selected Price.*?₹\s*([0-9,]+)/i,
    /ride-cost[^>]*>.*?₹\s*([0-9,]+)/i,
  ];
  // Extract and parse amount
}

private extractRideId(html: string): string | undefined {
  const patterns = [
    /Ride ID.*?([A-Z0-9]+)/i,
    /ride-value.*?align-right.*?([A-Z0-9]+)/i,
  ];
  // Extract ride ID
}

private extractLocations(html: string): {pickup?: string, dropoff?: string} {
  // Extract pickup and dropoff locations from table structure
  // Look for pickup.png and drop.png image patterns
  // Extract adjacent text content
}
```

### 4. API Route Refactoring

#### 4.1 Updated Search Logic
- **File**: `src/app/api/receipts/search/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    // Authentication (unchanged)
    const { userId } = await createUserContext();
    
    // Parameter validation (unchanged)
    const { startDate, endDate, maxResults } = validationResult.data;
    
    // Get Gmail access token (unchanged)
    const accessToken = await getValidAccessToken();
    const emailAuth = { userId, accessToken };
    
    // NEW: Search all services
    const serviceRegistry = new ServiceRegistry();
    serviceRegistry.registerService(ServiceType.UBER, new UberService());
    serviceRegistry.registerService(ServiceType.RAPIDO, new RapidoService());
    
    const allReceipts: Receipt[] = [];
    
    // Search each service
    for (const service of serviceRegistry.getAllServices()) {
      try {
        const searchResults = await service.searchReceipts(
          emailAuth, startDateTime, endDateTime, maxResults
        );
        
        if (searchResults.emails.length > 0) {
          const parsingResults = await service.parseReceipts(searchResults.emails);
          
          const serviceReceipts = parsingResults
            .filter(result => result.success)
            .map(result => transformToReceipt(result.receipt));
            
          allReceipts.push(...serviceReceipts);
        }
      } catch (error) {
        console.warn(`Failed to search ${service.serviceName} receipts:`, error);
        // Continue with other services
      }
    }
    
    // Sort all receipts by date (newest first)
    allReceipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json({
      success: true,
      message: `Found ${allReceipts.length} receipts from ${serviceRegistry.getAllServices().length} services`,
      data: allReceipts,
    });
  } catch (error) {
    // Error handling (unchanged)
  }
}
```

### 5. Extended Type System

#### 5.1 Enhanced Receipt Interface
- **File**: `src/app/types.ts`

```typescript
export interface Receipt {
  id: string;
  date: string;
  amount: number;
  currency?: string;        // NEW: Support multiple currencies
  location: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupTime?: string;
  dropoffTime?: string;
  pdfUrl?: string;
  service: string;          // NEW: Which service (Uber, Rapido, etc.)
  serviceId?: string;       // NEW: Service-specific ID (tripId, rideId)
  driverName?: string;      // NEW: Driver information
  vehicleInfo?: string;     // NEW: Vehicle number/type
}
```

#### 5.2 Service-Specific Types
- **File**: `src/lib/services/rapido/types.ts`

```typescript
export interface RapidoReceiptData extends ParsedReceipt {
  rideId: string;
  customerName?: string;
  driverName?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  timeOfRide?: string;
}
```

### 6. Configuration and Constants

#### 6.1 Service Configuration
- **File**: `src/lib/services/config.ts`

```typescript
export const SERVICE_CONFIG = {
  [ServiceType.UBER]: {
    name: 'Uber',
    senders: ['receipts@uber.com', 'uber.receipts@uber.com', 'noreply@uber.com'],
    subjects: ['trip with Uber', 'Your Uber Receipt', 'Thanks for riding'],
  },
  [ServiceType.RAPIDO]: {
    name: 'Rapido',
    senders: ['shoutout@rapido.bike'],
    subjects: ['Your trip with Rapido'],
  },
};
```

### 7. Testing Strategy

#### 7.1 Unit Tests Structure
```
src/lib/services/__tests__/
├── uber/
│   ├── UberService.test.ts
│   ├── html-parser.test.ts
│   └── email-query-builder.test.ts
├── rapido/
│   ├── RapidoService.test.ts
│   ├── html-parser.test.ts
│   └── email-query-builder.test.ts
└── registry.test.ts
```

#### 7.2 Test Data
- Create mock HTML samples for both Uber and Rapido
- Test edge cases for parsing failures
- Test service registry functionality
- Test API route with multiple services

### 8. Migration Strategy

#### 8.1 Phase 1: Refactor Uber Service (Non-breaking)
1. Create service interface and registry
2. Move Uber code to new service structure
3. Update imports but keep existing API behavior
4. Test thoroughly to ensure no regression

#### 8.2 Phase 2: Add Rapido Service
1. Implement Rapido service following the interface
2. Create Rapido HTML parser for provided email format
3. Register Rapido service in API route
4. Test combined results

#### 8.3 Phase 3: Enhance API Response
1. Update Receipt interface with new fields
2. Ensure backward compatibility
3. Add service information to responses
4. Update frontend to handle new data structure

### 9. Future Extensibility

#### 9.1 Adding New Services
To add a new service (e.g., Ola, Grab), developers need to:

1. **Create service directory**: `src/lib/services/[service-name]/`
2. **Implement service class**: Extend `ReceiptService` interface
3. **Create parser**: Handle service-specific email format
4. **Add configuration**: Update service config
5. **Register service**: Add to service registry in API route

#### 9.2 Service Plugin Architecture
Future enhancement could include:
- Dynamic service registration
- Service-specific configuration files
- Service health checks and fallbacks
- Service-specific rate limiting

### 10. Error Handling and Resilience

#### 10.1 Service-Level Error Handling
- Each service should handle its own errors gracefully
- Failed services shouldn't break the entire search
- Log service-specific errors for debugging

#### 10.2 Partial Results
- Return results from successful services even if others fail
- Include service status in API response
- Provide clear error messages for troubleshooting


## Implementation Timeline

### Week 1: Foundation
- [ ] Create service interface and types
- [ ] Implement service registry
- [ ] Create basic Uber service structure

### Week 2: Uber Migration
- [ ] Move Uber code to service structure
- [ ] Update imports and dependencies
- [ ] Test Uber service thoroughly

### Week 3: Rapido Implementation
- [ ] Implement Rapido service class
- [ ] Create Rapido HTML parser
- [ ] Test Rapido parsing with provided email format

### Week 4: Integration
- [ ] Update API route for multi-service support
- [ ] Implement combined search and sorting
- [ ] End-to-end testing

### Week 5: Polish and Documentation
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Documentation and code comments
- [ ] Final testing and deployment

## Success Criteria

1. **Functional Requirements**
   - ✅ Uber service continues to work without regression
   - ✅ Rapido service successfully extracts receipt data from provided email format
   - ✅ Combined search returns sorted results from both services
   - ✅ Easy to add new services following established pattern

2. **Non-Functional Requirements**
   - ✅ No performance degradation compared to single service
   - ✅ Graceful handling of service failures
   - ✅ Maintainable and well-documented code
   - ✅ Comprehensive test coverage

3. **Extensibility Requirements**
   - ✅ Clear documentation for adding new services  
   - ✅ Standardized service interface
   - ✅ Minimal code changes required for new services
   - ✅ Backward compatibility maintained

This implementation plan provides a solid foundation for adding Rapido support while creating an extensible architecture for future receipt services. 