import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Last-Mile Delivery Tracker",
  description: "Role-based delivery operations platform",
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
