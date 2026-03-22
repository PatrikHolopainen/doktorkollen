import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://doktorkollen.com'),
  title: {
    default: 'Doktorkollen – Hitta rätt vårdgivare i Sverige',
    template: '%s | Doktorkollen',
  },
  description:
    'Doktorkollen hjälper dig hitta rätt läkare, psykolog, fysioterapeut och annan sjukvårdspersonal i Sverige. Jämför vårdgivare, läs om tjänster och tillstånd.',
  keywords: [
    'vårdgivare',
    'läkare',
    'psykolog',
    'fysioterapeut',
    'klinik',
    'sjukvård',
    'Sverige',
    'hälsa',
  ],
  authors: [{ name: 'Doktorkollen' }],
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://doktorkollen.com',
    siteName: 'Doktorkollen',
    title: 'Doktorkollen – Hitta rätt vårdgivare i Sverige',
    description:
      'Hitta rätt läkare, psykolog, fysioterapeut och klinik i Sverige. Enkelt och snabbt.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doktorkollen – Hitta rätt vårdgivare i Sverige',
    description: 'Hitta rätt läkare och kliniker i Sverige.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
