import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { PageTransition } from "@/components/layout/PageTransition";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Find My JAANU 💘",
    template: "%s | Find My JAANU",
  },
  description:
    "Meet someone who loves chai, code, and evrything in between. A modern social matching platform.",
    keywords: ["dating", "match", "jaanu", "social", "india"],
    authors: [{ name: "Find My JAANU" }],
    icons: {
      icon: "/favicon.svg",
    },
    openGraph: {
      title: "Find My JAANU 💘",
      description:
        "Meet someone who loves chai, code, and everything in between.",
      url: "https://findmyjaanu.com",
      siteName: "Find My JAANU",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Find My JAANU",
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Find My JAANU 💘",
      description:
        "Meet someone who loves chai, code, and everything in between.",
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <OfflineBanner />
          <Navbar />
          <PageTransition>
            <div className="flex-1">{children}</div>
          </PageTransition>
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: "inherit",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}