"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { savePhotos, loadPhotos, clearPhotos, type StoredPhoto } from "@/lib/db"

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
  const [restoring, setRestoring] = useState(true)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    (async () => {
      try {
        const stored = await loadPhotos()
        if (stored.length > 0) {
          const restored = stored.map((s) => ({
            id: s.id,
            file: new File([s.data], s.name, { type: s.type }),
            preview: URL.createObjectURL(new Blob([s.data], { type: s.type })),
          }))
          setPhotos(restored)
        }
      } catch { /* ignore */ }
      setRestoring(false)
    })()
  }, [])

  useEffect(() => {
    if (restoring) return
    persist()
  }, [photos, restoring])

  async function persist() {
    try {
      const stored: StoredPhoto[] = await Promise.all(
        photos.map(async (p) => ({
          id: p.id,
          name: p.file.name,
          type: p.file.type,
          data: await p.file.arrayBuffer(),
        }))
      )
      await savePhotos(stored)
    } catch { /* ignore */ }
  }

  function addFiles(files: FileList) {
    setError(null)
    const arr = Array.from(files)
    const remaining = MAX_FILES - photos.length

    if (arr.length > remaining) {
      setError(`Solo ${remaining} foto(s) mas (max ${MAX_FILES})`)
      return
    }

    const valid = arr.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`Formato no valido: ${f.name}`)
        return false
      }
      if (f.size > MAX_SIZE) {
        setError(`Archivo muy grande: ${f.name}`)
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
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files)
        if (cameraInputRef.current) cameraInputRef.current.value = ""
        if (galleryInputRef.current) galleryInputRef.current.value = ""
      }
    },
    [photos.length]
  )

  const handleCameraCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files)
        if (cameraInputRef.current) cameraInputRef.current.value = ""
        if (galleryInputRef.current) galleryInputRef.current.value = ""
      }
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
      await clearPhotos()
    } catch (err: any) {
      setError(err.message ?? "Error al subir fotos")
    } finally {
      setUploading(false)
    }
  }

  const remaining = MAX_FILES - photos.length

  if (restoring) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
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

      {photos.length === 0 ? (
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Tomar foto
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => galleryInputRef.current?.click()}
            className="w-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Subir desde galeria
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-cream/60">{photos.length}/{MAX_FILES} fotos</p>
            <button
              onClick={() => {
                photos.forEach((p) => URL.revokeObjectURL(p.preview))
                setPhotos([])
                clearPhotos()
              }}
              className="text-xs text-cream/40 hover:text-cream/70 transition-colors"
            >
              Limpiar todo
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square">
                <img
                  src={photo.preview}
                  alt={photo.file.name}
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1.5 right-1.5 bg-ink/70 text-cream rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => cameraInputRef.current?.click()}
                disabled={remaining === 0}
                className="flex-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Tomar otra
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => galleryInputRef.current?.click()}
                disabled={remaining === 0}
                className="flex-1 border border-gold/20"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Galeria
              </Button>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleUpload}
              loading={uploading}
              disabled={photos.length === 0}
              className="w-full"
            >
              {uploading ? "Subiendo..." : `Enviar ${photos.length} foto(s)`}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}
    </div>
  )
}
