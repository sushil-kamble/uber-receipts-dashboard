"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

interface GmailConnectionProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export default function GmailConnection({
  onConnectionChange,
}: GmailConnectionProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();

  // Check for success or error messages from the OAuth callback
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      toast.success(decodeURIComponent(success));
    }

    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  // Fetch the Gmail connection status on component mount
  useEffect(() => {
    async function checkGmailConnection() {
      try {
        const response = await fetch("/api/auth/gmail/status");
        const data = await response.json();

        if (data.success) {
          const connectionStatus = data.data.isConnected;
          setIsConnected(connectionStatus);
          if (onConnectionChange) {
            onConnectionChange(connectionStatus);
          }
        } else {
          console.error("Error checking Gmail connection:", data.error);
          toast.error("Failed to check Gmail connection status");
        }
      } catch (error) {
        console.error("Error checking Gmail connection:", error);
        toast.error("Failed to check Gmail connection status");
      } finally {
        setIsLoading(false);
      }
    }

    checkGmailConnection();
  }, []);

  // Handle the "Connect Gmail" button click
  const handleConnectGmail = async () => {
    try {
      // Redirect to the authorization endpoint
      window.location.href = "/api/auth/gmail/authorize";
    } catch (error) {
      console.error("Error connecting to Gmail:", error);
      toast.error("Failed to initiate Gmail connection");
    }
  };

  // Handle the "Unlink Gmail" button click
  const handleUnlinkGmail = async () => {
    try {
      const response = await fetch("/api/auth/gmail/unlink", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setIsConnected(false);
        if (onConnectionChange) {
          onConnectionChange(false);
        }
        toast.success("Gmail account unlinked successfully");
      } else {
        toast.error(data.error || "Failed to unlink Gmail account");
      }
    } catch (error) {
      console.error("Error unlinking Gmail:", error);
      toast.error("Failed to unlink Gmail account");
    }
  };

  return (
    <div className="flex flex-col mb-5 bg-card rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center">
              <i className="bx bx-loader-alt text-lg animate-spin mr-2"></i>
              <p className="text-sm">Checking connection...</p>
            </div>
          ) : isConnected ? (
            <div className="flex items-center">
              <i className="bx bxs-check-circle text-green-500 mr-2"></i>
              <p className="text-sm">Gmail connected</p>
            </div>
          ) : (
            <div className="flex items-center">
              <i className="bx bxs-x-circle text-red-500 mr-2"></i>
              <p className="text-sm">Gmail not connected</p>
            </div>
          )}
        </div>
        {isConnected ? (
          <Button
            onClick={handleUnlinkGmail}
            variant="outline"
            className="flex items-center"
          >
            <i className="bx bx-unlink mr-2"></i>
            Unlink Gmail
          </Button>
        ) : (
          <Button
            onClick={handleConnectGmail}
            disabled={isLoading}
            className="flex items-center"
          >
            <i className="bx bx-envelope mr-2"></i>
            Connect Gmail
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {isConnected
          ? "Your Gmail account is connected. You can now search for cab receipts in your inbox."
          : "Connect your Gmail account to search for cab receipts in your inbox."}
      </p>
    </div>
  );
}
