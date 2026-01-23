import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const META_PIXEL_ID = "1433466544843565";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ambitco.app"),
  title: "AMBIT",
  description: "Gain More Leads",
  openGraph: {
    title: "AMBIT",
    description: "Gain More Leads",
    url: "https://www.ambitco.app/",
    siteName: "AMBIT",
    type: "website",
    images: [
      {
        url: "https://www.ambitco.app/og.jpeg",
        width: 1200,
        height: 630,
        alt: "AMBIT — Gain More Leads",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AMBIT",
    description: "Gain More Leads",
    images: ["https://www.ambitco.app/og.jpeg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-[#0B1430] via-[#0D1A3A] to-[#0F2048] text-white">
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>

        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        <div className="min-h-screen flex flex-col">
          <SiteNav />

          <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">
            {children}
          </main>

          <SiteFooter />
        </div>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
