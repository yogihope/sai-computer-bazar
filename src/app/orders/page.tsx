import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrdersContent from "@/components/orders/OrdersContent";

export const metadata: Metadata = {
  title: "My Orders | SCB - Sai Computer Bazar",
  description: "View and manage your orders at SCB - Sai Computer Bazar.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OrdersContent />
      <Footer />
    </div>
  );
}
