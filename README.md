# Next.js + Clerk Authentication Template

A modern, production-ready template featuring Next.js 15, Clerk Authentication, and Tailwind CSS v4. This template provides a solid foundation for building secure web applications with built-in authentication and authorization.

## Features

- 🔐 Authentication with [Clerk](https://clerk.com)
- 🎨 Styling with [Tailwind CSS v4](https://tailwindcss.com)
- 🚀 Next.js 15 App Router
- 🛠 Type checking with TypeScript
- 🐳 Docker support for PostgreSQL
- 🔥 Clean project structure
- 🎯 Pre-configured error & 404 pages

## Prerequisites

- Node.js 22+ (preferably using `pnpm`)
- Docker and Docker Compose (for PostgreSQL)
- npm or yarn or pnpm or bun

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/sushil-kamble/next-js-clerk-template.git
cd next-js-clerk-template
```

Alternatively, you can specify a project name:

```bash
git clone https://github.com/sushil-kamble/next-js-clerk-template.git <<project-name>>
cd <<project-name>>
```

2. Remove existing git history and initialize as a new repository:

```bash
# Remove git history
rm -rf .git

# Initialize new git repository
git init

# Add your files and create initial commit
git add .
git commit -m "Initial commit"

# (Optional) Add your new remote repository
git remote add origin <your-repository-url>
git branch -M main
git push -u origin main
```

3. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

4. Create and configure your Clerk project:

- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Create a new project
- Set up a webhook endpoint in your Clerk project settings:
  - Point to: `/api/clerk/webhook`
  - Select required events for your webhook

5. Configure your environment:
- Copy `.env.example` to `.env.local`
- Add your Clerk API keys and other required variables
- (Optional) Modify the PostgreSQL container name in `docker-compose.yml` if needed:
  ```yaml
  container_name: your_preferred_name  # Default: nextjs_clerk_postgres_template
  ```

6. Start the PostgreSQL database:

```bash
docker-compose up -d
```

7. Test webhook locally (optional):
```bash
# Start the tunnel to expose your local server
pnpm run tunnel
```

8. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Docker Commands
```bash
# Start the PostgreSQL database
docker-compose up -d

# Stop the PostgreSQL database
docker-compose down

# View logs
docker-compose logs postgres

# Access PostgreSQL CLI
docker exec -it nextjs_clerk_postgres_template psql -U postgres
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Bash Script

This project includes a bash script to automatically update the README.md file. The script is located in the `.bash` directory.

### Usage

1. Make it executable:
   ```bash
   chmod +x .bash/update-readme.sh
   ```

2. Run the script:
   ```bash
   .bash/update-readme.sh
   ```

### Script Content

```bash
chmod +x .bash/update-readme.sh
.bash/update-readme.sh
```

The script automatically:
- Extracts the current project directory name
- Generates a new README.md with project documentation
- Updates the content while preserving the structure
