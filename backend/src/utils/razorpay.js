import crypto from "node:crypto";
import Razorpay from "razorpay";
import env from "../config/env.js";

// When keys are configured we use the real Razorpay SDK.
// Otherwise we run in MOCK mode so the whole flow is testable end-to-end
// without any account. Mock orders/payments are clearly prefixed.

let client = null;
if (env.razorpay.enabled) {
  client = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });
}

export const isMock = !env.razorpay.enabled;

export async function createPaymentOrder({ amount, receipt, notes }) {
  if (client) {
    return client.orders.create({
      amount, // paise
      currency: "INR",
      receipt,
      notes,
    });
  }
  // mock order
  return {
    id: "order_mock_" + crypto.randomBytes(8).toString("hex"),
    amount,
    currency: "INR",
    receipt,
    status: "created",
    mock: true,
  };
}

// Verify the signature Razorpay Checkout returns to the browser.
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (isMock) {
    // In mock mode any payment that starts with pay_mock_ is accepted.
    return typeof paymentId === "string" && paymentId.startsWith("pay_mock_");
  }
  const expected = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

// Verify webhook signature (X-Razorpay-Signature header)
export function verifyWebhookSignature(rawBody, signature, secret) {
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}
