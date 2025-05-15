import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
      <div className="w-64 h-64 mx-auto text-muted-foreground">
        <Image
          src="/svgs/not-found-404.svg"
          alt="404 illustration"
          width={256}
          height={256}
          className="w-full h-full"
          priority
        />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold">404</h2>
        <p className="text-muted-foreground">This page could not be found.</p>
        <blockquote className="italic text-sm text-muted-foreground mt-4">
          &quot;
          {"Not all those who wander are lost, but this page definitely is."}
          &quot;
        </blockquote>
      </div>
      <Button variant="outline" asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
