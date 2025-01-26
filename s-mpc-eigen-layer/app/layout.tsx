import "./globals.css"
import Providers from "./providers"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import type { Metadata } from 'next'
import React from 'react'
import localFont from 'next/font/local'

const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Black.ttf',
      weight: '900',
      style: 'normal',
    }
  ],
  fallback: [
    '-apple-system', 
    'BlinkMacSystemFont', 
    'Segoe UI', 
    'Roboto', 
    'Oxygen', 
    'Ubuntu', 
    'Cantarell', 
    'Fira Sans', 
    'Droid Sans', 
    'Helvetica Neue', 
    'sans-serif'
  ],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "SMPC EigenLayer",
  description: "Secure Multi-Party Computation Platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}

