import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/context/app-context'
import { ToastContainer } from '@/components/toast-container'
import './globals.css'

export const metadata: Metadata = {
  title: 'TaskBuddy - Team Task Management',
  description: 'The all-in-one platform for managing tasks, collaborating with teams, and delivering projects on time',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <AppProvider>
          {children}
          <ToastContainer />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </AppProvider>
      </body>
    </html>
  )
}
