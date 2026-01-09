import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountDashboard from "@/components/account/AccountDashboard";

export const metadata: Metadata = {
  title: "My Account | SCB - Sai Computer Bazar",
  description: "Manage your account, orders, and preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AccountDashboard />
      </main>
      <Footer />
    </div>
  );
}
