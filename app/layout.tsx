import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remuse AI Candidate Screening",
  description: "Evidence-first candidate screening prototype"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
