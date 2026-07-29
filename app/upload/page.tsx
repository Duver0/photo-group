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
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center text-red-700">
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
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <p className="text-green-700 font-medium text-lg">Fotos subidas exitosamente!</p>
          <p className="text-green-600 text-sm mt-1">Puedes cerrar esta pagina.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Subir fotos</h1>
        <p className="text-zinc-500 mt-1">Tus fotos se guardaran en Google Drive del organizador</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700 text-sm">{error}</CardContent>
        </Card>
      )}

      <PhotoUploader onUpload={handleUpload} />
    </div>
  )
}

export default function UploadPage() {
  return (
    <div className="flex flex-1 items-start justify-center pt-8">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        }
      >
        <UploadForm />
      </Suspense>
    </div>
  )
}
