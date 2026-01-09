import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderSuccessContent from "@/components/orders/OrderSuccessContent";

export const metadata: Metadata = {
  title: "Order Successful | SCB - Sai Computer Bazar",
  description: "Your order has been placed successfully.",
  robots: {
    index: false,
    follow: false,
  },
};

function LoadingFallback() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<LoadingFallback />}>
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
