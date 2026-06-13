// Lightweight loader for the Razorpay browser checkout script.
let loadingPromise: Promise<void> | null = null;

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (e: string, cb: (r: unknown) => void) => void;
    };
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  method?: { upi?: boolean; card?: boolean; netbanking?: boolean; wallet?: boolean };
  config?: {
    display?: {
      blocks?: Record<
        string,
        { name: string; instruments: Array<{ method: string; flows?: string[] }> }
      >;
      sequence?: string[];
      preferences?: { show_default_blocks?: boolean };
    };
  };
  handler: (resp: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if (window.Razorpay) return Promise.resolve();
  if (loadingPromise) return loadingPromise;
  loadingPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loadingPromise = null;
      reject(new Error("Failed to load Razorpay"));
    };
    document.head.appendChild(s);
  });
  return loadingPromise;
}

export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error("Razorpay unavailable");

  // Default: surface UPI (GPay / PhonePe / Paytm / BHIM) prominently,
  // followed by cards, netbanking and wallets. Caller can override via
  // `options.method` / `options.config`.
  const merged: RazorpayOptions = {
    ...options,
    currency: options.currency || "INR",
    method: options.method ?? {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
    },
    config: options.config ?? {
      display: {
        blocks: {
          upi_block: {
            name: "Pay using UPI",
            instruments: [
              { method: "upi", flows: ["intent", "collect", "qr"] },
            ],
          },
          other_block: {
            name: "Other payment methods",
            instruments: [
              { method: "card" },
              { method: "netbanking" },
              { method: "wallet" },
            ],
          },
        },
        sequence: ["block.upi_block", "block.other_block"],
        preferences: { show_default_blocks: false },
      },
    },
  };

  const rp = new window.Razorpay(merged);
  rp.open();
}
