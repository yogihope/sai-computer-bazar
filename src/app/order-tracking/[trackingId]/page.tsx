import { Metadata } from "next";
import { use } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderTrackingContent from "@/components/order/OrderTrackingContent";

interface OrderTrackingPageProps {
  params: Promise<{ trackingId: string }>;
}

export const metadata: Metadata = {
  title: "Track Order | SCB - Sai Computer Bazar",
  description: "Track your order delivery status in real-time.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { trackingId } = use(params);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OrderTrackingContent trackingId={trackingId} />
      <Footer />
    </div>
  );
}
