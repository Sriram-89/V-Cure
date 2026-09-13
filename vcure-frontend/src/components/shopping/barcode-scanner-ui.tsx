"use client";

import { useState } from "react";
import { ScanLine, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useBarcodeLookup } from "@/hooks/use-shopping";

export function BarcodeScannerUI() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const lookup = useBarcodeLookup();

  const handleLookup = () => {
    if (!manualBarcode.trim()) return;
    lookup.mutate(manualBarcode.trim());
  };

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <ScanLine className="h-4 w-4" aria-hidden="true" />
        Scan a barcode
      </h2>

      {isScannerOpen ? (
        <div className="mt-4">
          <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-md bg-black">
            <div className="h-32 w-56 rounded-md border-2 border-primary-400" aria-hidden="true" />
            <p className="absolute bottom-3 text-xs text-white/80">
              Camera preview would appear here
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setIsScannerOpen(false)}>
            Close scanner
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setIsScannerOpen(true)}>
          <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
          Open scanner
        </Button>
      )}

      <div className="mt-4 flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Or enter barcode manually"
            placeholder="e.g. 8901030123"
            value={manualBarcode}
            onChange={(event) => setManualBarcode(event.target.value)}
          />
        </div>
        <Button type="button" size="sm" onClick={handleLookup} isLoading={lookup.isPending}>
          Look up
        </Button>
      </div>

      {lookup.isSuccess && !lookup.data ? (
        <p className="mt-2 text-sm text-text-secondary">No product found for that barcode.</p>
      ) : null}
      {lookup.isSuccess && lookup.data ? (
        <p className="mt-2 text-sm text-text-primary">
          Found: <span className="font-medium">{lookup.data.name}</span> — ₹{lookup.data.pricePerUnit}
        </p>
      ) : null}
      {lookup.isError ? (
        <div role="alert" className="mt-2 flex items-center gap-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Couldn&apos;t look up that barcode.
        </div>
      ) : null}
    </div>
  );
}
