// src/app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KRBYLAND",
  description: "Welcome to KRBYLAND!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-darkBg text-white font-modern">
        <header className="p-4">
          <nav>
            <a href="/" className="text-neonBlue font-retro">
              KRBYLAND
            </a>
            {/* Add more links as needed */}
          </nav>
        </header>
        
        <main>{children}</main>
        
        <footer className="p-4 mt-8 text-center text-retroPink">
          © {new Date().getFullYear()} KRBYLAND
        </footer>
      </body>
    </html>
  )
}
