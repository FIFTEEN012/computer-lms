import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono, IBM_Plex_Sans_Thai, Chakra_Petch } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-heading' 
})
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
})
const ibmPlexThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body' 
})
const chakraPetch = Chakra_Petch({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-thai-heading'
})

export const metadata: Metadata = {
  title: 'KINETIC_TERMINAL // CS_LMS_PRO_v2.5',
  description: 'แพลตฟอร์มการเรียนรู้ล้ำสมัยสถาปัตยกรรมแบบรวมศูนย์ โดย อ.บูน',
}

import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning className="dark">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${ibmPlexThai.variable} ${chakraPetch.variable} font-body antialiased selection:bg-accent-primary/30 selection:text-white`}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <div className="relative min-h-screen bg-bg-primary overflow-x-hidden">
               {/* Global Overlays */}
               <div className="grid-overlay fixed inset-0 z-0 pointer-events-none opacity-20"></div>
               <div className="scanlines-tv fixed inset-0 z-[100] pointer-events-none"></div>
               
               <div className="relative z-10 min-h-screen flex flex-col">
                  {children}
               </div>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
