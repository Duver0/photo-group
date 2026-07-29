import { auth } from "@/lib/auth"
import { getDriveClient, getOrCreateRootFolder, findRootFolder, getOrCreateDateFolder, listDateFolders } from "@/lib/drive"

function getDateStr() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const drive = getDriveClient(session.accessToken)
    const rootId = await findRootFolder(drive)
    if (!rootId) return Response.json({ folders: [] })
    const folders = await listDateFolders(drive, rootId)
    return Response.json({ folders })
  } catch (error: any) {
    console.error("GET /folders error:", error)
    return Response.json({ error: "Error al obtener carpetas" }, { status: 500 })
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
    const dateStr = getDateStr()
    const result = await getOrCreateDateFolder(drive, rootId, dateStr)

    return Response.json(
      { rootFolderId: rootId, folderId: result.folderId, name: dateStr, created: result.created },
      result.created ? { status: 201 } : { status: 200 }
    )
  } catch (error: any) {
    console.error("POST /folders error:", error)
    return Response.json({ error: "Error al crear carpeta" }, { status: 500 })
  }
}
