"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { PhotoUploader } from "@/components/photo-uploader"
import { Card, CardContent } from "@/components/ui/card"

function UploadForm() {
  const searchParams = useSearchParams()
  const folder = searchParams.get("folder")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!folder) {
    return (
      <Card className="border-red-500/50 bg-red-950/30">
        <CardContent className="p-8 text-center text-red-400">
          Enlace invalido. Escanea el codigo QR nuevamente.
        </CardContent>
      </Card>
    )
  }

  async function handleUpload(files: File[]) {
    setError(null)
    const formData = new FormData()
    files.forEach((f) => formData.append("files", f))
    formData.append("folderId", folder!)

    const res = await fetch("/api/drive/upload", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? "Error al subir fotos")
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 space-y-6">
        <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center">
          <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gold">Fotos enviadas</h2>
        <p className="text-cream/60">Gracias por compartir este momento especial.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full border-2 border-gold/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gold">Comparte tus fotos</h1>
          <p className="text-cream/50 text-sm leading-relaxed">
            Sube las fotos que tomaste durante este dia especial. 
            Quedaran guardadas en el album de los novios.
          </p>
        </div>

        {error && (
          <Card className="border-red-500/50 bg-red-950/30">
            <CardContent className="p-4 text-red-400 text-sm">{error}</CardContent>
          </Card>
        )}

        <PhotoUploader onUpload={handleUpload} />
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      }
    >
      <UploadForm />
    </Suspense>
  )
}
