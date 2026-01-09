import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
// Replace with your actual credentials in production
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret",
});

// Create Razorpay order
export async function createRazorpayOrder(
  amount: number, // Amount in INR (will be converted to paise)
  currency: string = "INR",
  receipt: string,
  notes?: Record<string, string>
) {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes: notes || {},
    });

    return {
      success: true,
      order,
    };
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return {
      success: false,
      error: error.message || "Failed to create payment order",
    };
  }
}

// Verify Razorpay payment signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret")
      .update(body.toString())
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Get payment details
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment,
    };
  } catch (error: any) {
    console.error("Error fetching payment:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch payment details",
    };
  }
}

// Initiate refund
export async function initiateRefund(
  paymentId: string,
  amount?: number, // Optional: partial refund amount in INR
  notes?: Record<string, string>
) {
  try {
    const refundOptions: any = {
      notes: notes || {},
    };

    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    return {
      success: true,
      refund,
    };
  } catch (error: any) {
    console.error("Refund error:", error);
    return {
      success: false,
      error: error.message || "Failed to initiate refund",
    };
  }
}

export { razorpay };
