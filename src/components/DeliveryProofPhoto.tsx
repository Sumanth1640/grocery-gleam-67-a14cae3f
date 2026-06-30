import { useState } from "react";
import { Camera, X, ExternalLink, AlertTriangle } from "lucide-react";

function resolveProofUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl, typeof window !== "undefined" ? window.location.origin : "https://hallifresh.in");
    const marker = "/php-backend/uploads/";
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex >= 0) {
      const relPath = parsed.pathname.slice(markerIndex + marker.length);
      parsed.pathname = parsed.pathname.slice(0, markerIndex) + "/php-backend/api/uploads/file.php";
      parsed.search = `?path=${encodeURIComponent(relPath)}`;
      return parsed.toString();
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

export function DeliveryProofPhoto({ url, label = "Delivery proof" }: { url?: string | null; label?: string }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!url) return null;
  const imageUrl = resolveProofUrl(url);
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Camera className="h-3 w-3" /> {label}
      </div>
      {!failed ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 block overflow-hidden rounded-lg border bg-card hover:opacity-90"
        >
          <img
            src={imageUrl}
            alt={label}
            className="h-24 w-24 object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setFailed(true)}
          />
        </button>
      ) : (
        <div className="mt-2 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-2 text-[11px]">
          <div className="flex items-center gap-1 font-semibold text-destructive">
            <AlertTriangle className="h-3 w-3" /> Photo failed to load
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 break-all text-primary underline"
          >
            <ExternalLink className="h-3 w-3" /> {url}
          </a>
        </div>
      )}
      {open && !failed && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/80 p-4" onClick={() => setOpen(false)}>
          <button
            className="absolute right-4 top-4 rounded-full bg-background p-2 shadow-pop"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={imageUrl}
            alt={label}
            className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
