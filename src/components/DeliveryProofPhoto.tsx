import { useState } from "react";
import { Camera, X } from "lucide-react";

export function DeliveryProofPhoto({ url, label = "Delivery proof" }: { url?: string | null; label?: string }) {
  const [open, setOpen] = useState(false);
  if (!url) return null;
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Camera className="h-3 w-3" /> {label}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 block overflow-hidden rounded-lg border bg-card hover:opacity-90"
      >
        <img src={url} alt={label} className="h-24 w-24 object-cover" loading="lazy" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/80 p-4" onClick={() => setOpen(false)}>
          <button
            className="absolute right-4 top-4 rounded-full bg-background p-2 shadow-pop"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <img src={url} alt={label} className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
