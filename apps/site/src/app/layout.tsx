import "./globals.css";
import type { Metadata } from "next";
import Footer from "@/app/components/Footer/Footer";
import Navbar from "@/app/components/Navbar/Navbar";
import { wotfard } from "styles/fonts";

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
    <html lang="en" className={wotfard.className}>
      <body className="my-8">
        <div className="min-h-screen flex flex-col justify-between pt-0 md:pt-8 p-8">
          <main className="max-w-[56ch] mx-auto w-full space-y-4">
            <Navbar></Navbar>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
