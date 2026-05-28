import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FlashMessage } from "@/components/ui/FlashMessage";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'MaNaDa — Artículos de Temporada',
    template: '%s | MaNaDa',
  },
  description: 'Descubrí las mejores tendencias en artículos de temporada. Compras online seguras con envío a todo el país.',
  keywords: ['ropa', 'temporada', 'moda', 'indumentaria', 'artículos', 'manada', 'tienda online'],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'MaNaDa',
    title: 'MaNaDa — Artículos de Temporada',
    description: 'Descubrí las mejores tendencias en artículos de temporada.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaNaDa — Artículos de Temporada',
    description: 'Descubrí las mejores tendencias en artículos de temporada.',
  },
  icons: {
    icon: '/Logo.jpeg',
    shortcut: '/Logo.jpeg',
    apple: '/Logo.jpeg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s===null&&p))document.documentElement.classList.add('dark');})();`,
          }}
        />
        <Navbar />
        <main className={`flex-1 flex flex-col ${isAdmin ? '' : 'pb-16 md:pb-0'}`}>
          {children}
        </main>
        {!isAdmin && <BottomNav />}
        <Suspense>
          <FlashMessage />
        </Suspense>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
