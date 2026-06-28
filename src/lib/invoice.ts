// Invoice helpers. The in-app /orders/$id/invoice route renders the invoice
// using buildInvoiceHtml(); downloadInvoiceFile() saves it as a standalone HTML.
type OrderLike = {
  id: string;
  created_at: string;
  status: string;
  payment: string;
  subtotal: number;
  delivery: number;
  total: number;
  scheduled_for?: string | null;
  items: Array<{ product: { name: string; price: number; weight?: string }; qty: number }>;
  address: {
    full_name: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    pincode: string;
  };
};

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Inner HTML for the invoice sheet (no <html>/<body>). Safe to inject into a host page. */
export function buildInvoiceHtml(order: OrderLike): string {
  const rows = order.items
    .map(
      (it) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px">${escapeHtml(it.product.name)}${it.product.weight ? `<br/><small style="color:#666">${escapeHtml(it.product.weight)}</small>` : ""}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${it.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;text-align:right">₹${it.product.price}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;text-align:right">₹${it.product.price * it.qty}</td>
        </tr>`,
    )
    .join("");
  const a = order.address;
  return `
    <h1 style="margin:0 0 4px 0;font-size:22px">hallifresh</h1>
    <div style="color:#666;font-size:12px">Tax invoice</div>
    <div style="display:flex;justify-content:space-between;gap:24px;margin:24px 0;flex-wrap:wrap;font-size:13px">
      <div>
        <div><strong>Invoice #</strong> ${order.id.slice(0, 8).toUpperCase()}</div>
        <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</div>
        <div><strong>Status:</strong> <span style="display:inline-block;padding:2px 8px;border-radius:6px;background:#e8f5ee;color:#0a7a3f;font-size:11px;font-weight:700;text-transform:uppercase">${escapeHtml(order.status)}</span></div>
        <div><strong>Payment:</strong> ${escapeHtml(order.payment.toUpperCase())}</div>
        ${order.scheduled_for ? `<div><strong>Scheduled:</strong> ${new Date(order.scheduled_for).toLocaleString()}</div>` : ""}
      </div>
      <div>
        <div><strong>Billed to</strong></div>
        <div>${escapeHtml(a.full_name)}</div>
        <div>${escapeHtml(a.line1)}${a.line2 ? `, ${escapeHtml(a.line2)}` : ""}</div>
        <div>${escapeHtml(a.city)} &mdash; ${escapeHtml(a.pincode)}</div>
        <div>+91 ${escapeHtml(a.phone)}</div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <thead><tr>
        <th style="padding:8px;background:#f7f7f7;text-align:left;font-size:13px;border-bottom:1px solid #eee">Item</th>
        <th style="padding:8px;background:#f7f7f7;text-align:center;font-size:13px;border-bottom:1px solid #eee">Qty</th>
        <th style="padding:8px;background:#f7f7f7;text-align:right;font-size:13px;border-bottom:1px solid #eee">Price</th>
        <th style="padding:8px;background:#f7f7f7;text-align:right;font-size:13px;border-bottom:1px solid #eee">Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr><td colspan="3" style="padding:8px;text-align:right;font-weight:700">Subtotal</td><td style="padding:8px;text-align:right;font-weight:700">&#8377;${order.subtotal}</td></tr>
        <tr><td colspan="3" style="padding:8px;text-align:right;font-weight:700">Delivery</td><td style="padding:8px;text-align:right;font-weight:700">${order.delivery ? `&#8377;${order.delivery}` : "FREE"}</td></tr>
        <tr><td colspan="3" style="padding:8px;text-align:right;font-size:18px;font-weight:800">Total</td><td style="padding:8px;text-align:right;font-size:18px;font-weight:800">&#8377;${order.total}</td></tr>
      </tfoot>
    </table>
    <p style="color:#666;font-size:12px;margin-top:32px">Thank you for shopping with hallifresh.</p>
  `;
}

/** Save the invoice as a standalone HTML file the user can open/share. */
export async function downloadInvoiceFile(order: OrderLike) {
  const fileName = `invoice-${order.id.slice(0, 8)}.html`;
  const full = `<!doctype html><html><head><meta charset="utf-8"/><title>Invoice ${order.id.slice(0, 8)}</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;color:#111;margin:0;background:#fff;padding:24px;max-width:720px;margin:0 auto}</style>
</head><body>${buildInvoiceHtml(order)}</body></html>`;

  // Native (Capacitor) path — Android WebView blocks blob downloads, so write
  // to the device cache and open the system share sheet instead.
  try {
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      const Filesystem = cap.Plugins?.Filesystem;
      const Share = cap.Plugins?.Share;
      if (!Filesystem || !Share) throw new Error("Capacitor Filesystem/Share plugin not installed");
      const res = await Filesystem.writeFile({
        path: fileName,
        data: full,
        directory: "CACHE",
        encoding: "utf8",
      });
      await Share.share({
        title: `Invoice ${order.id.slice(0, 8)}`,
        text: `Invoice for order #${order.id.slice(0, 8)}`,
        url: res.uri,
        dialogTitle: "Save or share invoice",
      });
      return;
    }
  } catch (err) {
    console.warn("native invoice share failed, falling back to blob", err);
  }


  try {
    const blob = new Blob([full], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 500);
  } catch {
    window.print();
  }
}
