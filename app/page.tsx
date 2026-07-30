"use client"

import { useSession, signIn } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    )
  }

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
      <div className="max-w-sm space-y-8">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full border-2 border-gold/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-gold">Photo Group</h1>
          <p className="text-cream/50 text-sm leading-relaxed">
            Comparte un codigo QR con tus invitados para que todos puedan 
            subir sus fotos a un mismo album digital.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full"
        >
          Iniciar sesion con Google
        </Button>
      </div>
    </div>
  )
}
