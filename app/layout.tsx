import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";

import "./globals.css";
import NotificationProvider from "@/components/NotificationProvider";
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito-sans",
});

export const metadata: Metadata = {
  title: "KZARRĒ Admin",
  description: "Admin Dashboard Platform",
  icons: {
    icon: "/logo.png",
  },
  keywords: ["Admin Dashboard", "KZARRĒ", "Management", "Next.js"],
  authors: [{ name: "Creonox Technologies", url: "https://www.creonox.in" }],
  openGraph: {
    title: "KZARRĒ Admin",
    description: "Admin Dashboard Platform",
    url: "https://www.creonox.in",
    siteName: "KZARRĒ",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KZARRĒ Admin",
    description: "Admin Dashboard Platform",
    images: ["/og-image.png"],
    site: "@creonox",
    creator: "@creonox",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunitoSans.variable} font-nunito-sans`}>
      <body className="antialiased bg-gray-50 font-nunito-sans">
         <NotificationProvider onClose={undefined} />
        {children}

      </body>
    </html>
  );
}
