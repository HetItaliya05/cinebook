// src/types/razorpay.d.ts

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: () => void): void;
}

declare class Razorpay {
  constructor(options: RazorpayOptions);
  open(): void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}