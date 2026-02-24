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
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "caterpi11ar",
      url: siteUrl,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Dentic",
      url: siteUrl,
      description:
        "Scientific tooth brushing app with 3D oral navigation and Bass Method guidance.",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "MobileApplication",
      "@id": `${siteUrl}/#app`,
      name: "Dentic",
      description:
        "Scientific tooth brushing app with 3D oral navigation and habit tracking. Guides users through the Bass Method with a segmented timer and daily streaks.",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web, iOS, Android",
      url: siteUrl,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": `${siteUrl}/#organization` },
    },
  ],
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
