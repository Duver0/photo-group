"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { SignOutButton } from "@/components/auth-buttons"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-zinc-900 text-lg">
          Photo Group
        </Link>
        <div className="flex items-center gap-4">
          {session && (
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
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
