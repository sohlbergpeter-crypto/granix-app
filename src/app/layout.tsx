import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Granix Planering",
  description: "Internt planeringssystem för Granix.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className="dark">
      <body>{children}</body>
    </html>
  );
}
