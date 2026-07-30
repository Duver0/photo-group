"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function SignInButton() {
  return (
    <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
      Sign in with Google
    </Button>
  )
}

export function SignOutButton() {
  const { data: session } = useSession()

  if (!session?.user) return null

  return (
    <div className="flex items-center gap-3">
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name ?? ""}
          className="h-7 w-7 rounded-full ring-1 ring-gold/30"
        />
      )}
      <span className="text-sm text-cream/60 hidden sm:inline">{session.user.name}</span>
      <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
        Salir
      </Button>
    </div>
  )
}
