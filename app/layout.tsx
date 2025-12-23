import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";

export const metadata: Metadata = {
  title: "AMBIT",
  description: "Find the right government opportunities for your company.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-[#0B1430] via-[#0D1A3A] to-[#0F2048] text-white">
        <div className="min-h-screen flex flex-col">
          <SiteNav />

          <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">
            {children}
          </main>

          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
