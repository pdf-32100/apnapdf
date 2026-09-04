// Loads the Razorpay Checkout script once.
let scriptPromise = null;
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Runs the payment step and resolves with a razorpay-style response
 * { razorpay_order_id, razorpay_payment_id, razorpay_signature }.
 *
 * In MOCK mode (no keys configured) we skip the real checkout and
 * synthesize a successful payment so the whole flow is testable.
 */
export async function payForOrder({ order, payment, customer, serviceTitle, siteName }) {
  if (payment.mock || !payment.keyId) {
    // brief pause to feel like a real redirect
    await new Promise((r) => setTimeout(r, 600));
    return {
      razorpay_order_id: payment.razorpayOrderId,
      razorpay_payment_id: "pay_mock_" + Math.random().toString(36).slice(2, 12),
      razorpay_signature: "",
      mock: true,
    };
  }

  const ok = await loadRazorpayScript();
  if (!ok) throw new Error("Could not load the payment gateway. Check your connection and try again.");

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency || "INR",
      name: siteName || "PrintWala",
      description: serviceTitle,
      order_id: payment.razorpayOrderId,
      prefill: {
        name: customer.customerName,
        email: customer.customerEmail,
        contact: customer.customerPhone || "",
      },
      theme: { color: "#c04a22" },
      handler: (resp) => resolve(resp),
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
    });
    rzp.on("payment.failed", (resp) =>
      reject(new Error(resp?.error?.description || "Payment failed. Please try again."))
    );
    rzp.open();
  });
}
