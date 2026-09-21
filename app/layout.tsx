import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
