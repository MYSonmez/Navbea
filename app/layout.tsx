import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/manrope";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Navbea | Operasyon Yönetimi";
  const description =
    "Navbea personel, varlık, erişim ve saha operasyonları yönetim uygulaması.";

  return {
    title,
    description,
    metadataBase: new URL(origin),
    icons: {
      icon: "/navbea-icon.png",
      apple: "/navbea-icon.png",
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "tr_TR",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1672,
          height: 941,
          alt: "Navbea operasyon yönetimi",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
