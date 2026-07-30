"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { SignOutButton } from "@/components/auth-buttons"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-gold/10 bg-ink/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gold text-lg tracking-wide">
          Photo Group
        </Link>
        <div className="flex items-center gap-4">
          {session && (
            <Link
              href="/dashboard"
              className="text-sm text-cream/60 hover:text-gold transition-colors"
            >
              Dashboard
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>
    </nav>
  )
}
