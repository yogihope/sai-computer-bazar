import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterContent from "@/components/auth/RegisterContent";

export const metadata: Metadata = {
  title: "Register | SCB - Sai Computer Bazar",
  description: "Create your SCB account to shop PC parts, gaming gear, and more.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <RegisterContent />
      </main>
      <Footer />
    </div>
  );
}
