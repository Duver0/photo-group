"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SignInButton } from "@/components/auth-buttons"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
      <div className="max-w-lg space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          Photo Group
        </h1>
        <p className="text-lg text-zinc-500">
          Genera un codigo QR para que otros puedan subir fotos directamente a tu Google Drive.
        </p>
        <SignInButton />
      </div>
    </div>
  )
}
