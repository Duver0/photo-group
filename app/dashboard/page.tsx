"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { QrDisplay } from "@/components/qr-display"
import { FolderGallery } from "@/components/folder-gallery"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type FoldersResponse = {
  rootFolderId: string
  folderId: string
  name: string
  created: boolean
}

type Folder = {
  id: string
  name: string
  createdTime: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [rootFolderId, setRootFolderId] = useState<string | null>(null)
  const [todayFolder, setTodayFolder] = useState<FoldersResponse | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingToday, setLoadingToday] = useState(true)
  const [loadingFolders, setLoadingFolders] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const folderRes = await fetch("/api/drive/folders", { method: "POST" })
        if (!folderRes.ok) throw new Error("Error al crear carpeta del dia")
        const data: FoldersResponse = await folderRes.json()
        setRootFolderId(data.rootFolderId)
        setTodayFolder(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoadingToday(false)
      }
    }

    if (status === "authenticated") init()
  }, [status])

  useEffect(() => {
    async function loadFolders() {
      try {
        const res = await fetch("/api/drive/folders")
        if (!res.ok) throw new Error("Error al cargar carpetas")
        const data = await res.json()
        setFolders(data.folders)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoadingFolders(false)
      }
    }

    if (status === "authenticated") loadFolders()
  }, [status])

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/")
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Comparte tu codigo QR para recibir fotos</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700 text-sm">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <div>
          {rootFolderId && (
            <QrDisplay rootFolderId={rootFolderId} baseUrl={baseUrl} />
          )}
        </div>

        <div className="space-y-6">
          {loadingToday ? (
            <Card>
              <CardContent className="p-6">
                <div className="h-6 w-48 bg-zinc-100 animate-pulse rounded mb-4" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-zinc-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : todayFolder ? (
            <div>
              <CardHeader>
                <CardTitle>
                  {todayFolder.name}
                  <span className="ml-2 text-sm font-normal text-blue-600">(Hoy)</span>
                </CardTitle>
              </CardHeader>
              <FolderGallery
                folders={[{ id: todayFolder.folderId, name: todayFolder.name, createdTime: "" }]}
              />
            </div>
          ) : null}

          <div>
            <CardHeader>
              <CardTitle>Todas las carpetas</CardTitle>
            </CardHeader>
            {loadingFolders ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-zinc-100 animate-pulse rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <FolderGallery folders={folders} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
