import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Footer from "@/app/components/Footer/Footer";
import Navbar from "@/app/components/Navbar/Navbar";
import { GeistSans } from "geist/font/sans";
import AnimatedName from "./components/AnimatedName/AnimatedName";
import { NameTransition } from "./components/NameTransition/NameTransition";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://rurangiza.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Arsène Rurangiza",
    template: "%s | Arsène Rurangiza",
  },
  description: "Software developer, indie-hacker, music lover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="antialiased tracking-tigh my-8">
        <div className="min-h-screen flex flex-col justify-between pt-0 md:pt-8 p-8">
          <main className="max-w-[60ch] mx-auto w-full space-y-4">
            <Navbar></Navbar>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
