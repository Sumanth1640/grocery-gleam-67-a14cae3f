import { useEffect, useState } from "react";

export type DeliveryAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  pincode: string;
  type: "Home" | "Work" | "Other";
};

const KEY = "hallifresh:delivery-address";

function read(): DeliveryAddress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DeliveryAddress) : null;
  } catch {
    return null;
  }
}

export function setDeliveryAddress(a: DeliveryAddress | null) {
  if (typeof window === "undefined") return;
  if (a) window.localStorage.setItem(KEY, JSON.stringify(a));
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("hallifresh:delivery-address-changed"));
}

export function useDeliveryAddress() {
  const [addr, setAddr] = useState<DeliveryAddress | null>(null);
  useEffect(() => {
    setAddr(read());
    const onChange = () => setAddr(read());
    window.addEventListener("hallifresh:delivery-address-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("hallifresh:delivery-address-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return addr;
}
