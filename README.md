# Cab Receipts

A Next.js application that helps you track and analyze your cab receipts by connecting to your Gmail account and automatically extracting receipt data.

## Features

- ⚡ Next.js 15 with App Router
- 🔒 Authentication with Clerk
- 📧 Gmail API integration to fetch cab receipts
- 📊 Receipt data extraction and parsing
- 📅 Date range filtering
- 📊 Receipt statistics and analytics
- 🎨 Tailwind CSS with shadcn/ui components
- 🌙 Light/dark mode support
- 🧰 TypeScript support
- 🛠 Development tools setup (ESLint, Prettier)
- 🗃 Database integration with DrizzleORM and PostgreSQL

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cab-receipts
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. Set up required environment variables in .env file:
   - Clerk authentication keys:
     - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
     - CLERK_SECRET_KEY
   - Gmail API credentials:
     - GOOGLE_CLIENT_ID
     - GOOGLE_CLIENT_SECRET
   - Database connection:
     - DATABASE_URL

5. Start the development server:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app` - Application routes and pages
- `/src/components` - Reusable UI components
- `/src/db` - Database configuration and schema
- `/src/lib` - Utility functions and shared logic
  - `/src/lib/email-client` - Gmail API integration
  - `/src/lib/receipt-parser` - cab receipt parsing logic
- `/src/types` - TypeScript type definitions

## How It Works

1. Sign in with Clerk authentication
2. Connect your Gmail account
3. Select a date range to search for cab receipts
4. View and analyze your receipt data
5. Export or manage your receipt information

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DrizzleORM Documentation](https://orm.drizzle.team/docs/overview)

## License

This project is licensed under the MIT License.
