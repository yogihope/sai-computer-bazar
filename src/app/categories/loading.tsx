import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Skeleton */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 md:py-16">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-muted rounded-xl animate-pulse" />
                  <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-12 w-72 bg-muted rounded mb-4 animate-pulse" />
                <div className="h-6 w-full max-w-lg bg-muted rounded animate-pulse" />
              </div>

              <div className="flex gap-4">
                <div className="h-20 w-32 bg-muted rounded-xl animate-pulse" />
                <div className="h-20 w-32 bg-muted rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar Skeleton */}
        <div className="border-b border-border bg-background">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-80 bg-muted rounded-lg animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Loading */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
