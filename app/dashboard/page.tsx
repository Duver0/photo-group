"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { QrDisplay } from "@/components/qr-display"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type FoldersResponse = {
  rootFolderId: string
  name: string
  created: boolean
}

type Photo = {
  id: string
  name: string
  thumbnailLink?: string
  webViewLink?: string
  createdTime: string
}

export default function Dashboard() {
  const { status } = useSession()
  const [rootFolderId, setRootFolderId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoCount, setPhotoCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== "authenticated") return

    async function init() {
      try {
        const folderRes = await fetch("/api/drive/folders", { method: "POST" })
        if (!folderRes.ok) throw new Error("Error al obtener la carpeta")
        const data: FoldersResponse = await folderRes.json()
        setRootFolderId(data.rootFolderId)

        const photosRes = await fetch(`/api/drive/photos?folderId=${data.rootFolderId}`)
        if (photosRes.ok) {
          const photosData = await photosRes.json()
          setPhotos((photosData.photos || []).slice(0, 6))
          setPhotoCount(photosData.photos?.length || 0)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [status])

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/")
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const driveFolderUrl = rootFolderId
    ? `https://drive.google.com/drive/folders/${rootFolderId}`
    : "#"

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-gold">Dashboard</h1>
        <p className="text-cream/50 text-sm mt-1">Comparte tu codigo QR para recibir fotos</p>
      </div>

      {error && (
        <Card className="border-red-500/50 bg-red-950/30">
          <CardContent className="p-4 text-red-400 text-sm">{error}</CardContent>
        </Card>
      )}

      <div className="flex flex-col items-center">
        {rootFolderId && (
          <QrDisplay rootFolderId={rootFolderId} baseUrl={baseUrl} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ultimas fotos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-24 bg-ink-light animate-pulse rounded" />
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-ink-light animate-pulse rounded-xl" />
                ))}
              </div>
            </div>
          ) : photoCount === 0 ? (
            <p className="text-sm text-cream/40 py-8 text-center">
              Sin fotos aun. Comparte tu codigo QR.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-cream/50">{photoCount} foto(s) en total</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.webViewLink ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square"
                  >
                    <img
                      src={photo.thumbnailLink ?? ""}
                      alt={photo.name}
                      className="w-full h-full object-cover rounded-xl hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <a
        href={driveFolderUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm text-gold/70 hover:text-gold transition-colors"
      >
        Ver todo en Google Drive &rarr;
      </a>
    </div>
  )
}
