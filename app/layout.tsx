import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { CartProvider } from '@/components/cart-provider'
import { Toaster } from '@/components/ui/sonner'


const nunito = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pequenosuy.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Pequeños UY — Sorpresas y regalos para fiestas infantiles',
    template: '%s | Pequeños UY',
  },
  description: 'Sorpresitas, bolsitas y regalos temáticos para cumpleaños infantiles en Uruguay. Personajes favoritos, dulces y mucha diversión.',
  keywords: ['sorpresitas infantiles', 'bolsitas cumpleaños', 'regalos fiestas niños', 'cumpleaños infantil uruguay', 'pequeños uy'],
  authors: [{ name: 'Pequeños UY' }],
  creator: 'Pequeños UY',
  openGraph: {
    type: 'website',
    locale: 'es_UY',
    url: siteUrl,
    siteName: 'Pequeños UY',
    title: 'Pequeños UY — Sorpresas y regalos para fiestas infantiles',
    description: 'Sorpresitas, bolsitas y regalos temáticos para cumpleaños infantiles en Uruguay.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Pequeños UY',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pequeños UY — Sorpresas y regalos para fiestas infantiles',
    description: 'Sorpresitas, bolsitas y regalos temáticos para cumpleaños infantiles en Uruguay.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${nunito.className} antialiased`}>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
