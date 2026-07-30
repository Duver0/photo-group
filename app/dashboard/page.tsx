"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { QrDisplay } from "@/components/qr-display"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type FoldersResponse = {
  rootFolderId: string
  folderId: string
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

type Folder = {
  id: string
  name: string
  createdTime: string
}

function getDateStr() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function Dashboard() {
  const { status } = useSession()
  const [rootFolderId, setRootFolderId] = useState<string | null>(null)
  const [todayFolder, setTodayFolder] = useState<FoldersResponse | null>(null)
  const [todayPhotos, setTodayPhotos] = useState<Photo[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [folders, setFolders] = useState<Folder[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== "authenticated") return

    async function init() {
      try {
        const folderRes = await fetch("/api/drive/folders", { method: "POST" })
        if (!folderRes.ok) throw new Error("Error al crear carpeta del dia")
        const data: FoldersResponse = await folderRes.json()
        setRootFolderId(data.rootFolderId)
        setTodayFolder(data)

        const [photosRes, listRes] = await Promise.all([
          fetch(`/api/drive/photos?folderId=${data.folderId}`),
          fetch("/api/drive/folders"),
        ])

        if (photosRes.ok) {
          const photosData = await photosRes.json()
          setTodayPhotos((photosData.photos || []).slice(0, 6))
          setTodayCount(photosData.photos?.length || 0)
        }

        if (listRes.ok) {
          const listData = await listRes.json()
          setFolders(listData.folders || [])
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

      <div className="relative w-full h-48 rounded-2xl overflow-hidden">
        <Image
          src="/wedding-banner.png"
          alt="Wedding"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
      </div>

      <div className="flex flex-col items-center">
        {rootFolderId && (
          <QrDisplay rootFolderId={rootFolderId} baseUrl={baseUrl} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {getDateStr()}
            <span className="ml-2 text-sm font-normal text-cream/40">(Hoy)</span>
          </CardTitle>
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
          ) : todayCount === 0 ? (
            <p className="text-sm text-cream/40 py-8 text-center">
              Sin fotos hoy. Comparte tu codigo QR.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-cream/50">{todayCount} foto(s) hoy</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {todayPhotos.map((photo) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Fechas anteriores</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-ink-light animate-pulse rounded-lg" />
              ))}
            </div>
          ) : folders.length === 0 ? (
            <p className="text-sm text-cream/40 py-4 text-center">No hay carpetas aun.</p>
          ) : (
            <div className="space-y-1">
              {folders.map((f) => (
                <div key={f.id} className="text-sm text-cream/50 py-2 border-b border-gold/5 last:border-0">
                  {f.name}
                </div>
              ))}
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
