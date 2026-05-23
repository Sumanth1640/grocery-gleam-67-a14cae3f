import { useEffect, useRef, useState } from "react";
import { Play, Upload, Trash2, X, Settings2 } from "lucide-react";
import { toast } from "sonner";
import {
  PRESETS,
  type AlertChannel,
  getChoice,
  setChoice,
  preview,
  setCustomFromFile,
  clearCustom,
  getCustomName,
  CUSTOM_MAX_BYTES,
} from "@/lib/alert-sounds";

type Row = { channel: AlertChannel; label: string; description: string };

export function AlertSoundSettingsButton({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Customize alert sounds"
        aria-label="Customize alert sounds"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-secondary"
      >
        <Settings2 className="h-4 w-4" />
      </button>
      {open && <SoundDialog rows={rows} onClose={() => setOpen(false)} />}
    </>
  );
}

function SoundDialog({ rows, onClose }: { rows: Row[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <div className="font-display text-lg font-bold">Alert sounds</div>
            <div className="text-xs text-muted-foreground">Pick a preset or upload your own (max {Math.round(CUSTOM_MAX_BYTES / 1024)} KB).</div>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-4">
          {rows.map((r) => (
            <ChannelEditor key={r.channel} channel={r.channel} label={r.label} description={r.description} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelEditor({ channel, label, description }: { channel: AlertChannel; label: string; description: string }) {
  const [choice, setChoiceState] = useState<string>(() => getChoice(channel));
  const [customName, setCustomName] = useState<string | null>(() => getCustomName(channel));
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setChoice(channel, choice);
  }, [channel, choice]);

  const onUpload = async (file: File) => {
    try {
      await setCustomFromFile(channel, file);
      setCustomName(file.name);
      setChoiceState("custom");
      toast.success("Custom sound saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="mb-2">
        <div className="text-sm font-bold">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="space-y-1">
        {PRESETS.map((p) => (
          <label key={p.id} className={`flex items-center gap-3 rounded-lg border p-2 text-sm ${choice === p.id ? "border-primary bg-primary/5" : ""}`}>
            <input
              type="radio"
              name={`sound-${channel}`}
              checked={choice === p.id}
              onChange={() => setChoiceState(p.id)}
              className="h-4 w-4"
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{p.label}</div>
              <div className="text-xs text-muted-foreground">{p.description}</div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); preview(channel, p.id); }}
              className="inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-semibold hover:bg-secondary"
            >
              <Play className="h-3 w-3" /> Play
            </button>
          </label>
        ))}

        <label className={`flex items-center gap-3 rounded-lg border p-2 text-sm ${choice === "custom" ? "border-primary bg-primary/5" : ""}`}>
          <input
            type="radio"
            name={`sound-${channel}`}
            checked={choice === "custom"}
            disabled={!customName}
            onChange={() => setChoiceState("custom")}
            className="h-4 w-4"
          />
          <div className="min-w-0 flex-1">
            <div className="font-semibold">Custom upload</div>
            <div className="truncate text-xs text-muted-foreground">{customName ?? "No file uploaded yet"}</div>
          </div>
          {customName && (
            <>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); preview(channel, "custom"); }}
                className="inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-semibold hover:bg-secondary"
              >
                <Play className="h-3 w-3" /> Play
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); clearCustom(channel); setCustomName(null); setChoiceState(getChoice(channel)); }}
                className="inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); fileRef.current?.click(); }}
            className="inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-semibold hover:bg-secondary"
          >
            <Upload className="h-3 w-3" /> Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
          />
        </label>
      </div>
    </div>
  );
}
