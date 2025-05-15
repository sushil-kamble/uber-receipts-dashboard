import { Button } from "@/components/ui/button";
import {
  ClerkLoaded,
  ClerkLoading,
  UserButton,
  SignInButton,
  SignedOut,
  SignedIn,
} from "@clerk/nextjs";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  return (
    <header className="border-b h-16">
      <div className="mx-auto container h-full">
        <div className="flex items-center justify-between h-full">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <i className="bx bxs-receipt text-2xl"></i>
            Uber Receipts
          </Link>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <ClerkLoading>
              <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button>Login</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </ClerkLoaded>
          </div>
        </div>
      </div>
    </header>
  );
}
