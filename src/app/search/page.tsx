import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchPageContent from "@/components/search/SearchPageContent";

export const metadata: Metadata = {
  title: "Search | Sai Computer Bazar",
  description: "Search for products, prebuilt PCs, and blog articles at Sai Computer Bazar",
  robots: {
    index: false,
    follow: true,
  },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <SearchPageContent initialQuery={q || ""} />
      </main>
      <Footer />
    </div>
  );
}
