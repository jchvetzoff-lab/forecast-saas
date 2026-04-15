import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

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
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <body className="min-h-screen" style={{ fontWeight: 250 }}>
        {children}
      </body>
    </html>
  )
}
