import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://dentic.caterpi11ar.com";

export const metadata: Metadata = {
  title: {
    default: "Dentic — Scientific Tooth Brushing App",
    template: "%s | Dentic",
  },
  description:
    "Build a lifelong brushing habit with Dentic — 3D oral navigation, Bass Method guidance, and daily check-in streaks. Brush smarter, not harder.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Dentic — Scientific Tooth Brushing App",
    description:
      "Build a lifelong brushing habit with 3D oral navigation and Bass Method guidance.",
    url: siteUrl,
    siteName: "Dentic",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dentic — Scientific Tooth Brushing App",
    description:
      "Build a lifelong brushing habit with 3D oral navigation and Bass Method guidance.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Dentic",
  description:
    "Scientific tooth brushing app with 3D oral navigation and habit tracking.",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  url: siteUrl,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
