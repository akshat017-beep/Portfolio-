import type { Metadata, Viewport } from "next";
import { Albert_Sans, Fragment_Mono } from "next/font/google";
import "./globals.css";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert",
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fragment",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Akshat Dobhal — Creating technology with purpose",
  description:
    "Computer Science & AI/ML student who turns curiosity into code, ideas into products, and problems into intelligent solutions.",
};

// No maximumScale / userScalable: browser zoom stays available.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#edf5ff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${albertSans.variable} ${fragmentMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
