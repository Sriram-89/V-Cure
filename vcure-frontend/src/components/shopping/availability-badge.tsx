import { Badge } from "@/components/ui/badge";
import type { ProductAvailability } from "@/types/shopping";

const CONFIG: Record<ProductAvailability, { label: string; variant: "primary" | "secondary" | "neutral" }> = {
  IN_STOCK: { label: "In stock", variant: "primary" },
  LIMITED: { label: "Limited stock", variant: "secondary" },
  OUT_OF_STOCK: { label: "Out of stock", variant: "neutral" }
};

export function AvailabilityBadge({ availability }: { availability: ProductAvailability }) {
  const config = CONFIG[availability];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
