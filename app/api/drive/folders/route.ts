import { auth } from "@/lib/auth"
import { getDriveClient, getOrCreateRootFolder, findRootFolder } from "@/lib/drive"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const drive = getDriveClient(session.accessToken)
    const rootFolderId = await findRootFolder(drive)
    return Response.json({ rootFolderId })
  } catch (error: any) {
    console.error("GET /folders error:", error)
    return Response.json({ error: error?.message || "Error al obtener carpeta" }, { status: 500 })
  }
}

export async function POST() {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const drive = getDriveClient(session.accessToken)
    const rootId = await getOrCreateRootFolder(drive)

    return Response.json(
      { rootFolderId: rootId, name: "Photo-Group", created: false },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("POST /folders error:", error)
    return Response.json({ error: error?.message || "Error al crear carpeta" }, { status: 500 })
  }
}
