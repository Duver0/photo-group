"use client"

import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const MAX_FILES = 10
const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"]

type PhotoFile = {
  id: string
  file: File
  preview: string
}

type PhotoUploaderProps = {
  onUpload: (files: File[]) => Promise<void>
}

export function PhotoUploader({ onUpload }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList) {
    setError(null)
    const arr = Array.from(files)
    const remaining = MAX_FILES - photos.length

    if (arr.length > remaining) {
      setError(`Solo puedes seleccionar ${remaining} foto(s) mas (maximo ${MAX_FILES})`)
      return
    }

    const valid = arr.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`Tipo no soportado: ${f.name}`)
        return false
      }
      if (f.size > MAX_SIZE) {
        setError(`Archivo demasiado grande: ${f.name}`)
        return false
      }
      return true
    })

    const newPhotos = valid.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
    }))

    setPhotos((prev) => [...prev, ...newPhotos])

    if (cameraInputRef.current) cameraInputRef.current.value = ""
    if (galleryInputRef.current) galleryInputRef.current.value = ""
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id)
      if (photo) URL.revokeObjectURL(photo.preview)
      return prev.filter((p) => p.id !== id)
    })
  }

  const handleGalleryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) addFiles(e.target.files)
    },
    [photos.length]
  )

  const handleCameraCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) addFiles(e.target.files)
    },
    [photos.length]
  )

  async function handleUpload() {
    if (photos.length === 0) return
    setUploading(true)
    setError(null)
    try {
      await onUpload(photos.map((p) => p.file))
      setPhotos([])
    } catch (err: any) {
      setError(err.message ?? "Error al subir fotos")
    } finally {
      setUploading(false)
    }
  }

  const remaining = MAX_FILES - photos.length

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Subir fotos</h2>

        <div className="flex gap-3">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={remaining === 0}
          >
            Tomar foto
          </Button>
          <Button
            variant="secondary"
            onClick={() => galleryInputRef.current?.click()}
            disabled={remaining === 0}
          >
            Subir desde galeria
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {photos.length > 0 && (
          <div>
            <p className="text-sm text-zinc-500 mb-3">
              {photos.length}/{MAX_FILES} fotos seleccionadas
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square">
                  <img
                    src={photo.preview}
                    alt={photo.file.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Button onClick={handleUpload} loading={uploading} disabled={photos.length === 0}>
                {uploading ? "Subiendo..." : `Subir ${photos.length} foto(s)`}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
