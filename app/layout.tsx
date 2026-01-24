import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import NotificationProvider from "@/components/NotificationProvider";
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito-sans",
});

export const metadata: Metadata = {
  title: "KZARRÈ Admin",
  description: "Admin Dashboard Platform",
  icons: {
    icon: "/logo.png",
  },
  keywords: ["Admin Dashboard", "KZARRÈ", "Management", "Next.js"],
  authors: [{ name: "Creonox Technologies", url: "https://www.creonox.in" }],
  openGraph: {
    title: "KZARRÈ Admin",
    description: "Admin Dashboard Platform",
    url: "https://www.creonox.in",
    siteName: "KZARRÈ",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KZARRÈ Admin",
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
        <SpeedInsights />
      </body>
    </html>
  );
}
