import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutContent from "@/components/checkout/CheckoutContent";

export const metadata: Metadata = {
  title: "Checkout | SCB - Sai Computer Bazar",
  description: "Complete your purchase securely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <CheckoutContent />
      </main>
      <Footer />
    </div>
  );
}
