import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
// import { SmoothScroll } from "@/components/SmoothScroll"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "OmniCast AI — Forecasting Multi-Couches",
  description:
    "Combiner intelligence en essaim, foundation models et signaux geopolitiques temps reel pour anticiper ce que le ML classique ne voit pas.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen" style={{ fontWeight: 250 }}>
        {children}
      </body>
    </html>
  )
}
