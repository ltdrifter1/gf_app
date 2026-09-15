import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { BRAND } from "@/lib/brand";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${BRAND.domain}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: BRAND.name,
  description: BRAND.tagline,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: BRAND.name,
    statusBarStyle: "default",
  },
  openGraph: {
    title: BRAND.name,
    description: BRAND.landingLine,
    url: siteUrl,
    siteName: BRAND.name,
    images: [{ url: "/og-logo.png", width: 512, height: 512, alt: BRAND.ogAlt }],
    type: "website",
  },
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
