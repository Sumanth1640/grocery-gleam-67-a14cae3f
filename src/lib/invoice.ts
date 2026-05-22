// Generates a printable HTML invoice and triggers print/download.
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

export function downloadInvoice(order: OrderLike) {
  const rows = order.items
    .map(
      (it) => `
        <tr>
          <td>${escapeHtml(it.product.name)}${it.product.weight ? `<br/><small>${escapeHtml(it.product.weight)}</small>` : ""}</td>
          <td style="text-align:center">${it.qty}</td>
          <td style="text-align:right">₹${it.product.price}</td>
          <td style="text-align:right">₹${it.product.price * it.qty}</td>
        </tr>`,
    )
    .join("");

  const a = order.address;
  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>Invoice ${order.id.slice(0, 8)}</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;color:#111;padding:32px;max-width:720px;margin:auto}
  h1{margin:0 0 4px 0;font-size:22px}
  .muted{color:#666;font-size:12px}
  .grid{display:flex;justify-content:space-between;gap:24px;margin:24px 0}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  th,td{padding:8px;border-bottom:1px solid #eee;font-size:13px}
  th{background:#f7f7f7;text-align:left}
  tfoot td{font-weight:700;border-bottom:none}
  .total{font-size:18px;font-weight:800}
  .badge{display:inline-block;padding:2px 8px;border-radius:6px;background:#e8f5ee;color:#0a7a3f;font-size:11px;font-weight:700;text-transform:uppercase}
</style></head><body>
  <h1>freshcart</h1>
  <div class="muted">Tax invoice</div>
  <div class="grid">
    <div>
      <div><strong>Invoice #</strong> ${order.id.slice(0, 8).toUpperCase()}</div>
      <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</div>
      <div><strong>Status:</strong> <span class="badge">${escapeHtml(order.status)}</span></div>
      <div><strong>Payment:</strong> ${escapeHtml(order.payment.toUpperCase())}</div>
      ${order.scheduled_for ? `<div><strong>Scheduled:</strong> ${new Date(order.scheduled_for).toLocaleString()}</div>` : ""}
    </div>
    <div>
      <div><strong>Billed to</strong></div>
      <div>${escapeHtml(a.full_name)}</div>
      <div>${escapeHtml(a.line1)}${a.line2 ? `, ${escapeHtml(a.line2)}` : ""}</div>
      <div>${escapeHtml(a.city)} — ${escapeHtml(a.pincode)}</div>
      <div>+91 ${escapeHtml(a.phone)}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr><td colspan="3" style="text-align:right">Subtotal</td><td style="text-align:right">₹${order.subtotal}</td></tr>
      <tr><td colspan="3" style="text-align:right">Delivery</td><td style="text-align:right">${order.delivery ? `₹${order.delivery}` : "FREE"}</td></tr>
      <tr><td colspan="3" style="text-align:right" class="total">Total</td><td style="text-align:right" class="total">₹${order.total}</td></tr>
    </tfoot>
  </table>
  <p class="muted" style="margin-top:32px">Thank you for shopping with freshcart.</p>
  <script>window.onload=()=>setTimeout(()=>window.print(),200);</script>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${order.id.slice(0, 8)}.html`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
