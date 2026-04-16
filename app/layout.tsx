import { Manrope, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata = {
  title: "Dinas Pertanian dan Tanaman Pangan Aceh Utara",
  description: "Rancang Bangun Sistem Rekomendasi Pemilihan Varietas Unggulan Tanaman Hortikultura",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("antialiased", manrope.variable, inter.variable)}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
