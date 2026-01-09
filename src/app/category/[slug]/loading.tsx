import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Skeleton */}
        <div className="relative overflow-hidden bg-muted/30 animate-pulse">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 md:py-20">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="h-12 w-80 bg-muted rounded mb-4" />
                <div className="h-6 w-full max-w-lg bg-muted rounded" />
              </div>

              <div className="flex gap-4">
                <div className="h-20 w-32 bg-muted rounded-xl" />
                <div className="h-20 w-32 bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Loading */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading category...</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
