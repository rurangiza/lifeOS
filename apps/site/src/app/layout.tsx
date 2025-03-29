import "./globals.css";
import type { Metadata } from "next";
import Footer from "@/app/components/Footer/Footer";
import Navbar from "@/app/components/Navbar/Navbar";
import localFont from "next/font/local";

const wotfard = localFont({
  src: [
    {
      path: "../../assets/font/wotfard-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../assets/font/wotfard-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/font/wotfard-regularitalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../assets/font/wotfard-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../assets/font/wotfard-mediumitalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../assets/font/wotfard-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../assets/font/wotfard-semibolditalic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../assets/font/wotfard-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

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
