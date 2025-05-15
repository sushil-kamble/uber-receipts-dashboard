# Application Context

This is a Next.js application using the App Router architecture with TypeScript. The application structure follows these key patterns:

## Project Structure
- `/src/app` - Contains Next.js route handlers and page components
- `/src/components` - Reusable React components
- `/src/db` - Database schemas and configurations using Drizzle ORM
- `/src/lib` - Utility functions and shared code

## API Structure
- Route handlers are located in `src/app/api/***/route.ts`
- Each route handler typically handles multiple HTTP methods (GET, POST, PUT, DELETE)
- API responses use a consistent format through `ApiResponse.success()` or `handleError()`
- Authentication context is managed through `createUserContext()`

## Database
- PostgreSQL database using Drizzle ORM
- Database schemas are defined in the `src/db` directory
- Common operations include:
  - CRUD operations using Drizzle query builders

## Data Fetching
- Client-side data fetching uses custom hooks and utilities:
  - `useFetch` - A wrapper around `useSWR` for data fetching
  - `fetcher` - Utility for making HTTP requests

## Example Usage Patterns

### Data Fetching:
```typescript
// For GET requests
const { data, error, isLoading, mutate } = useFetch<ResponseType>("/api-endpoint");

// For POST/PUT/DELETE etc requests
await fetcher("/api-endpoint", {
  method: "POST|PUT|DELETE",
  body: JSON.stringify(data)
});
```

### Route Handler Pattern
```typescript
export async function POST(request: NextRequest) {
  try {
    const { userId } = await createUserContext();
    // Validate request body
    // For Eg:
    //   const validatedData = validate(
    //   updateTodoSchema,
    //   body,
    //   "Failed to update todo"
    // );

    // Perform database operations
    // For Eg:
    //   const result = await db.todo.update({
    //   where: { id: validatedData.id },
    //   data: validatedData
    // });
    return ApiResponse.success(result);
  } catch (error) {
    return handleError(error);
  }
}
```

### Common Patterns to Follow
- Always validate request data using schema validation
- Use proper error handling with handleError
- Include authentication context using createUserContext
- Follow RESTful conventions for API endpoints
- Use TypeScript types for proper type safety
- Implement data mutations with optimistic updates when possible
- Use proper HTTP methods for different operations