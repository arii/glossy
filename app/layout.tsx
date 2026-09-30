import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glossy | Old English visual glosses",
  description: "An interactive visual gloss for reading Old English.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
