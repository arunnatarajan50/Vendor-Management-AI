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
  title: "Vendorum",
  description: "Vendor-ops MVP for SMB e-commerce teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-tight">Vendorum</a>
            <nav className="flex gap-4 text-sm text-gray-600">
              <a className="hover:text-black" href="/vendor">Vendor</a>
              <a className="hover:text-black" href="/customer">Customer</a>
              <a className="hover:text-black" href="/import">Import</a>
              <a className="hover:text-black" href="/matches">Matches</a>
              <a className="hover:text-black" href="/health">Health</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
