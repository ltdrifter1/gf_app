import type { Metadata } from "next";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "COM-C — Community C",
  description:
    "COM-C — You're not alone in this. Messenger buddies, MySpace-style pages, safe dining, and recipes for people living with celiac and gluten intolerance.",
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
    <html lang="en" className={`${sora.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
