"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] font-bold text-muted-foreground/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Oops!
            </span>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4" />
              Browse Products
            </Button>
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
}
