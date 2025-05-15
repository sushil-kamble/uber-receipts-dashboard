#!/bin/bash

# Get the parent directory name
PARENT_DIR=$(basename "$(pwd)")

# Create README content
cat > README.md << EOL
# ${PARENT_DIR}

This is a [Next.js](https://nextjs.org/) project template integrated with [Clerk](https://clerk.com/) for authentication and user management.

## Features

- ⚡ Next.js 14 with App Router
- 🔒 Authentication with Clerk
- 🎨 Tailwind CSS for styling
- 🧰 TypeScript support
- 📝 Basic Todo functionality as example
- 🛠 Development tools setup (ESLint, Prettier)
- 🗃 Database integration with DrizzleORM

## Getting Started

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd ${PARENT_DIR}
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

3. Copy the example environment file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Set up your Clerk account and add the required environment variables to .env file:
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
   - CLERK_WEBHOOK_SECRET

5. Start the development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- \`/src/app\` - Application routes and pages
- \`/src/components\` - Reusable UI components
- \`/src/db\` - Database configuration and schema
- \`/src/lib\` - Utility functions and shared logic
- \`/src/types\` - TypeScript type definitions

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DrizzleORM Documentation](https://orm.drizzle.team/docs/overview)

## License

This project is licensed under the MIT License.
EOL

echo "README.md has been updated successfully!"
