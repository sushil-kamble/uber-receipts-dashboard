import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./Header";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "./Footer";
import Provider from "./Provider";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uber Receipts Dashboard",
  description:
    "Manage and organize your Uber receipts efficiently. Search, download, and export receipts with ease.",
  generator: "Next.js",
  applicationName: "Uber Receipts Dashboard",
  keywords: ["uber", "receipts", "dashboard", "expense management"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  publisher: "Your Name",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  openGraph: {
    title: "Uber Receipts Dashboard",
    description:
      "Manage and organize your Uber receipts efficiently. Search, download, and export receipts with ease.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Uber Receipts Dashboard",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Uber Receipts Dashboard",
    description:
      "Manage and organize your Uber receipts efficiently. Search, download, and export receipts with ease.",
    creator: "@yourusername",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <html lang="en" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <head>
            <link
              href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
              rel="stylesheet"
            />
          </head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
          >
            <Header />
            <main className="container mx-auto flex-1">{children}</main>
            <Footer />
            <Toaster />
          </body>
        </ThemeProvider>
      </html>
    </Provider>
  );
}
