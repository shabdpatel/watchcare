// Centralized payments config
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

export function ensureRazorpayKey(): string {
  if (!RAZORPAY_KEY_ID) {
    // In dev, this helps catch missing env quickly
    throw new Error('Missing VITE_RAZORPAY_KEY_ID. Set it in .env.local');
  }
  return RAZORPAY_KEY_ID;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove();
      resolve(false);
    };
    document.body.appendChild(script);
  });
}
