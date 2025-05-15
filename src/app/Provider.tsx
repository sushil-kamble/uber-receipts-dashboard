import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

function Provider({ children }: { children: React.ReactNode }) {
  return <ClerkProvider afterSignOutUrl={"/"}> {children}</ClerkProvider>;
}

export default Provider;
