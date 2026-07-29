"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Photo = {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  thumbnailLink?: string
  createdTime: string
  size?: number
}

type FolderWithPhotos = {
  id: string
  name: string
  createdTime: string
  photos: Photo[]
  loading: boolean
}

type FolderGalleryProps = {
  folders: { id: string; name: string; createdTime: string }[]
}

function getDateStr() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function FolderGallery({ folders }: FolderGalleryProps) {
  const [foldersWithPhotos, setFoldersWithPhotos] = useState<FolderWithPhotos[]>([])

  useEffect(() => {
    setFoldersWithPhotos(
      folders.map((f) => ({ ...f, photos: [], loading: true }))
    )

    folders.forEach(async (folder) => {
      try {
        const res = await fetch(`/api/drive/photos?folderId=${folder.id}`)
        const data = await res.json()
        setFoldersWithPhotos((prev) =>
          prev.map((f) =>
            f.id === folder.id
              ? { ...f, photos: data.photos || [], loading: false }
              : f
          )
        )
      } catch {
        setFoldersWithPhotos((prev) =>
          prev.map((f) =>
            f.id === folder.id ? { ...f, photos: [], loading: false } : f
          )
        )
      }
    })
  }, [folders])

  if (folders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-zinc-500">
          No hay carpetas aun. Comparte tu codigo QR para empezar a recibir fotos.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {foldersWithPhotos.map((folder) => {
        const isToday = folder.name === getDateStr()
        return (
          <div key={folder.id}>
            <CardHeader className="pb-2">
              <CardTitle>
                {folder.name}
                {isToday && (
                  <span className="ml-2 text-sm font-normal text-blue-600">(Hoy)</span>
                )}
              </CardTitle>
              {!folder.loading && (
                <p className="text-sm text-zinc-500">{folder.photos.length} foto(s)</p>
              )}
            </CardHeader>
            <Card>
              <CardContent className="p-4">
                {folder.loading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg bg-zinc-100 animate-pulse" />
                    ))}
                  </div>
                ) : folder.photos.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-8">
                    Sin fotos en esta fecha
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {folder.photos.map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.webViewLink ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group aspect-square"
                      >
                        <img
                          src={photo.thumbnailLink ?? ""}
                          alt={photo.name}
                          className="w-full h-full object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
