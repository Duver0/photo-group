"use client"

import { useRef, useState, useCallback, useEffect } from "react"
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
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      photos.forEach((p) => URL.revokeObjectURL(p.preview))
    }
  }, [])

  function addFiles(files: FileList | File[]) {
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
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id)
      if (photo) URL.revokeObjectURL(photo.preview)
      return prev.filter((p) => p.id !== id)
    })
  }

  async function startCamera() {
    try {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => videoRef.current?.play()
      }
      setCameraActive(true)
      setError(null)
    } catch {
      setError("No se pudo acceder a la camara. Verifica los permisos.")
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" })
      const fileList = [file]
      const dt = new DataTransfer()
      fileList.forEach((f) => dt.items.add(f))
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files
      }
      addFiles(fileList)
    }, "image/jpeg")
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files)
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
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={remaining === 0}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={remaining === 0}
          >
            {cameraActive ? "Subir desde galeria" : "Seleccionar fotos"}
          </Button>
          <Button
            variant={cameraActive ? "danger" : "secondary"}
            onClick={cameraActive ? stopCamera : startCamera}
          >
            {cameraActive ? "Detener camara" : "Tomar foto"}
          </Button>
        </div>

        {cameraActive && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-md rounded-lg bg-black"
            />
            <Button
              onClick={capturePhoto}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
              disabled={remaining === 0}
            >
              Capturar
            </Button>
          </div>
        )}

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
