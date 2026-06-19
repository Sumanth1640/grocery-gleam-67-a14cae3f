// Tiny offline queue for rider status updates.
// Persists pending actions in localStorage and flushes when network is back.
import { php } from "@/lib/php-api";

export type QueuedUpdate = {
  id: string;
  assignment_id: string;
  status: "picked_up" | "delivered";
  proof_url?: string;
  queued_at: number;
};

const KEY = "rider.offline.queue.v1";

function read(): QueuedUpdate[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(q: QueuedUpdate[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function queueSize(): number {
  return read().length;
}

export function enqueueAssignmentUpdate(u: Omit<QueuedUpdate, "id" | "queued_at">): void {
  const q = read();
  q.push({ ...u, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, queued_at: Date.now() });
  write(q);
}

let flushing = false;
export async function flushQueue(): Promise<{ sent: number; remaining: number }> {
  if (flushing) return { sent: 0, remaining: queueSize() };
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { sent: 0, remaining: queueSize() };
  }
  flushing = true;
  let sent = 0;
  try {
    let q = read();
    while (q.length > 0) {
      const item = q[0];
      try {
        await php.rider.updateAssignment({
          assignment_id: item.assignment_id,
          status: item.status,
          proof_url: item.proof_url,
        });
        q = q.slice(1);
        write(q);
        sent++;
      } catch {
        // Stop on first failure; keep order.
        break;
      }
    }
    return { sent, remaining: q.length };
  } finally {
    flushing = false;
  }
}

export function initOfflineQueueAutoFlush(onChange?: (size: number) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = async () => {
    const r = await flushQueue();
    onChange?.(r.remaining);
  };
  window.addEventListener("online", handler);
  // Initial attempt on load
  void handler();
  return () => window.removeEventListener("online", handler);
}
