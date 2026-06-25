import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'CodeGuard AI',
  description: 'Smart Bug Detection and Code Quality Analysis System',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
