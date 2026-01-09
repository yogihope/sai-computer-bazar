import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrebuiltPCsContent from "@/components/prebuilt-pcs/PrebuiltPCsContent";

export const metadata: Metadata = {
  title: "Prebuilt Gaming PCs | SCB - Sai Computer Bazar",
  description: "Shop the best prebuilt gaming PCs in India. Expert-built systems with warranty and free shipping.",
  openGraph: {
    title: "Prebuilt Gaming PCs | SCB - Sai Computer Bazar",
    description: "Shop the best prebuilt gaming PCs in India. Expert-built systems with warranty and free shipping.",
    type: "website",
  },
};

export default function PrebuiltPCsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PrebuiltPCsContent />
      </main>
      <Footer />
    </div>
  );
}
