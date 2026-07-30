"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import Image from "next/image"
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
    <div className="min-h-[80vh] flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
          <Image
            src="/wedding-banner.png"
            alt="Wedding"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <h1 className="text-xl font-semibold text-gold">Comparte tus fotos</h1>
            <p className="text-cream/60 text-xs mt-1">
              Sube las fotos que tomaste durante este dia especial
            </p>
          </div>
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
