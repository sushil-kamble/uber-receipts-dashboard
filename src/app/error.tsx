"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
      <div className="w-64 h-64 mx-auto text-muted-foreground">
        <Image
          src="/svgs/error.svg"
          alt="Error illustration"
          width={256}
          height={256}
          className="w-full h-full"
          priority
        />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold">Oops!</h2>
        <p className="text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
        <blockquote className="italic text-sm text-muted-foreground mt-4">
          &quot;In the midst of chaos, there&apos;s also opportunity.&quot;
        </blockquote>
      </div>
      <Button variant="outline" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
