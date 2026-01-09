import { Metadata } from "next";
import { use } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderDetailContent from "@/components/order/OrderDetailContent";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: "Order Details | SCB - Sai Computer Bazar",
  description: "View your order details at SCB - Sai Computer Bazar.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = use(params);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OrderDetailContent orderId={orderId} />
      <Footer />
    </div>
  );
}
