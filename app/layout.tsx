import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
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
  title: "My Family Recipe Keeper - Digitize & Share Your Family Recipes",
  description: "AI-powered recipe management app for digitizing handwritten recipes, organizing your cookbook, and sharing family recipes with loved ones.",
  keywords: ["recipe manager", "recipe organizer", "family recipes", "recipe OCR", "digital cookbook", "recipe sharing"],
  authors: [{ name: "My Family Recipe Keeper Team" }],
  openGraph: {
    title: "My Family Recipe Keeper - Digitize & Share Your Family Recipes",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
