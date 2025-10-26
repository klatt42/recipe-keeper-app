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
  title: "Recipe Keeper - Digitize & Share Your Family Recipes",
  description: "AI-powered recipe management app for digitizing handwritten recipes, organizing your cookbook, and sharing family recipes with loved ones.",
  keywords: ["recipe manager", "recipe organizer", "family recipes", "recipe OCR", "digital cookbook", "recipe sharing"],
  authors: [{ name: "Recipe Keeper Team" }],
  openGraph: {
    title: "Recipe Keeper - Digitize & Share Your Family Recipes",
    description: "AI-powered recipe management app for digitizing handwritten recipes, organizing your cookbook, and sharing family recipes with loved ones.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
