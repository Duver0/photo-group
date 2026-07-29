import { auth } from "@/lib/auth"
import { getDriveClient, listPhotos } from "@/lib/drive"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "No autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get("folderId")

  if (!folderId) {
    return Response.json({ error: "folderId es requerido" }, { status: 400 })
  }

  try {
    const drive = getDriveClient(session.accessToken)
    const photos = await listPhotos(drive, folderId)
    return Response.json({ photos })
  } catch (error: any) {
    console.error("GET /photos error:", error)
    return Response.json({ error: "Error al obtener fotos" }, { status: 500 })
  }
}
