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
  const fileName = `invoice-${order.id.slice(0, 8)}.html`;
  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Invoice ${order.id.slice(0, 8)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:system-ui,-apple-system,sans-serif;color:#111;margin:0;background:#f4f4f5}
  .toolbar{position:sticky;top:0;z-index:10;display:flex;gap:8px;align-items:center;padding:10px 14px;background:#16a34a;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .toolbar .title{font-weight:700;flex:1;font-size:14px}
  .toolbar button{appearance:none;border:0;background:rgba(255,255,255,.18);color:#fff;font-weight:600;font-size:13px;padding:8px 12px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
  .toolbar button:hover{background:rgba(255,255,255,.28)}
  .sheet{background:#fff;max-width:720px;margin:16px auto;padding:24px;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
  h1{margin:0 0 4px 0;font-size:22px}
  .muted{color:#666;font-size:12px}
  .grid{display:flex;justify-content:space-between;gap:24px;margin:24px 0;flex-wrap:wrap}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  th,td{padding:8px;border-bottom:1px solid #eee;font-size:13px}
  th{background:#f7f7f7;text-align:left}
  tfoot td{font-weight:700;border-bottom:none}
  .total{font-size:18px;font-weight:800}
  .badge{display:inline-block;padding:2px 8px;border-radius:6px;background:#e8f5ee;color:#0a7a3f;font-size:11px;font-weight:700;text-transform:uppercase}
  @media print{.toolbar{display:none}.sheet{box-shadow:none;margin:0;padding:0;max-width:none}body{background:#fff}}
</style></head><body>
  <div class="toolbar">
    <button onclick="goBack()" aria-label="Back">&larr; Back</button>
    <div class="title">Invoice ${order.id.slice(0, 8).toUpperCase()}</div>
    <button onclick="downloadFile()" aria-label="Download">&darr; Download</button>
    <button onclick="window.print()" aria-label="Print">&#x1F5B6; Print</button>
  </div>
  <div class="sheet">
    <h1>hallifresh</h1>
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
        <div>${escapeHtml(a.city)} &mdash; ${escapeHtml(a.pincode)}</div>
        <div>+91 ${escapeHtml(a.phone)}</div>
      </div>
    </div>
    <table>
      <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr><td colspan="3" style="text-align:right">Subtotal</td><td style="text-align:right">&#8377;${order.subtotal}</td></tr>
        <tr><td colspan="3" style="text-align:right">Delivery</td><td style="text-align:right">${order.delivery ? `&#8377;${order.delivery}` : "FREE"}</td></tr>
        <tr><td colspan="3" style="text-align:right" class="total">Total</td><td style="text-align:right" class="total">&#8377;${order.total}</td></tr>
      </tfoot>
    </table>
    <p class="muted" style="margin-top:32px">Thank you for shopping with hallifresh.</p>
  </div>
  <script>
    function goBack(){ try{ if(window.history.length>1){ window.history.back(); return; } }catch(e){} try{ window.close(); }catch(e){} }
    function downloadFile(){
      try{
        var html = '<' + '!doctype html>' + document.documentElement.outerHTML;
        var blob = new Blob([html], {type:'text/html'});
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url; link.download = ${JSON.stringify(fileName)};
        document.body.appendChild(link); link.click();
        setTimeout(function(){ URL.revokeObjectURL(url); link.remove(); }, 500);
      }catch(e){ window.print(); }
    }
  </script>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
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
