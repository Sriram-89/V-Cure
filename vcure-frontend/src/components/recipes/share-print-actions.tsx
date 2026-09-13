"use client";

import { useState } from "react";
import { Share2, Printer, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SharePrintActions({ title }: { title: string }) {
  const [didCopy, setDidCopy] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or share failed — fall back to copy
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setDidCopy(true);
      setTimeout(() => setDidCopy(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" size="sm" onClick={handleShare}>
        {didCopy ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Link copied
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            Share
          </>
        )}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-3.5 w-3.5" aria-hidden="true" />
        Print
      </Button>
    </div>
  );
}
