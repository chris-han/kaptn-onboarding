import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "KAPTN Onboarding - Bridge Activation Protocol",
  description: "Calibrate your command style and assume your position on the bridge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased ${inter.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
