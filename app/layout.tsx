import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sorsogon Province Procurement",
  description:
    "Official Procurement Information Website of the Province of Sorsogon",
  applicationName: "Sorsogon Province Procurement",
  generator: "Next.js",
  keywords: [
    "Sorsogon Province",
    "procurement",
    "public procurement",
    "procurement information",
    "PMIS",
  ],
  authors: [
    {
      name: "Province of Sorsogon",
    },
  ],
  openGraph: {
    title: "Sorsogon Province Procurement",
    description:
      "Official Procurement Information Website of the Province of Sorsogon",
    type: "website",
    locale: "en_PH",
    siteName: "Sorsogon Province Procurement",
  },
  twitter: {
    card: "summary",
    title: "Sorsogon Province Procurement",
    description:
      "Official Procurement Information Website of the Province of Sorsogon",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
