import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbitio",
  description: "A browser-based coding playground for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
