import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginContent from "@/components/auth/LoginContent";

export const metadata: Metadata = {
  title: "Login | SCB - Sai Computer Bazar",
  description: "Login to your SCB account to manage orders, wishlist, and more.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LoginContent />
      </main>
      <Footer />
    </div>
  );
}
