import { Metadata } from "next";
import AdminLayoutWrapper from "./AdminLayoutWrapper";

export const metadata: Metadata = {
  title: {
    template: "%s | SCB Admin",
    default: "SCB Admin Dashboard",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
