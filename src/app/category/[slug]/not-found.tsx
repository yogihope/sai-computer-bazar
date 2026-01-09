import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FolderX, ArrowLeft, Home } from "lucide-react";

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-4 py-20">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <FolderX className="w-12 h-12 text-primary" />
          </div>

          {/* Content */}
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Category Not Found
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The category you&apos;re looking for doesn&apos;t exist or may have been removed.
            Browse our categories to find what you need.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/categories">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Categories
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
