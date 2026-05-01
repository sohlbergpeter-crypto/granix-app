import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.APP_URL || "https://app.granix.se";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Granix Planering",
  description: "Internt planeringssystem för Granix.",
  applicationName: "Granix Planering",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/brand/granix-logo.png",
    shortcut: "/brand/granix-logo.png",
    apple: "/brand/granix-logo.png",
  },
  openGraph: {
    title: "Granix Planering",
    description: "Internt planeringssystem för Granix.",
    url: appUrl,
    siteName: "Granix Planering",
    images: ["/brand/granix-logo.png"],
    locale: "sv_SE",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className="dark">
      <body>{children}</body>
    </html>
  );
}
