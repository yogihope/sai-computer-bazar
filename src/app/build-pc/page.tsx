import { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BuildPCContent from "@/components/build-pc/BuildPCContent";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Build Your PC | SCB - Sai Computer Bazar",
  description: "Build your custom PC with our interactive configurator. Real-time compatibility checks and expert recommendations.",
  openGraph: {
    title: "Build Your PC | SCB - Sai Computer Bazar",
    description: "Build your custom PC with our interactive configurator. Real-time compatibility checks and expert recommendations.",
    type: "website",
  },
};

function BuildPCLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading PC Builder...</p>
      </div>
    </div>
  );
}

export default function BuildPCPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<BuildPCLoading />}>
          <BuildPCContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
