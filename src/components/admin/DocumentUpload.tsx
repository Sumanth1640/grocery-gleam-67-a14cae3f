import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileUp, Loader2, FileText, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value: string;
  onChange: (path: string) => void;
  /** Document kind — used in the filename, e.g. "fssai", "pan", "gst". */
  kind: string;
  /** Auth user id; files are stored under {userId}/... per storage RLS. */
  userId: string;
  label?: string;
};

const ACCEPT = "application/pdf,image/png,image/jpeg,image/webp";

export function DocumentUpload({ value, onChange, kind, userId, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    if (!/(pdf|png|jpe?g|webp)$/i.test(file.name)) {
      toast.error("Use PDF, PNG, JPG, or WebP");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const path = `${userId}/${kind}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("partner-docs")
        .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
      if (error) throw error;
      onChange(path);
      toast.success("Document uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border bg-background p-3">
      {label && <div className="mb-1.5 text-xs font-semibold text-muted-foreground">{label}</div>}
      <div className="flex items-center gap-3">
        <div className={`grid h-12 w-12 place-items-center rounded-lg ${value ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
          {value ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold">{value ? value.split("/").pop() : "No file uploaded"}</div>
          <div className="text-[10px] text-muted-foreground">PDF / PNG / JPG · max 5MB · private</div>
        </div>
        {value && (
          <button type="button" onClick={() => onChange("")} className="grid h-7 w-7 place-items-center rounded-full border text-muted-foreground hover:bg-secondary" aria-label="Remove">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs font-semibold disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}
