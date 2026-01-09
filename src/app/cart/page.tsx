import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartContent from "@/components/cart/CartContent";

export const metadata: Metadata = {
  title: "Shopping Cart | SCB - Sai Computer Bazar",
  description: "Review your shopping cart and proceed to checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <CartContent />
      </main>
      <Footer />
    </div>
  );
}
