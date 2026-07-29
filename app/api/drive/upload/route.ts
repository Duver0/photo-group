import { auth } from "@/lib/auth"
import { getDriveClient, getOwnerDriveClient, getOrCreateDateFolder, uploadPhoto } from "@/lib/drive"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"]
const MAX_FILES = 10
const MAX_SIZE = 10 * 1024 * 1024

function getDateStr() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const folderId = formData.get("folderId") as string | null
    const owner = formData.get("owner") as string | null

    if (!folderId) {
      return Response.json({ error: "folderId es requerido" }, { status: 400 })
    }

    if (!files || files.length === 0) {
      return Response.json({ error: "No se enviaron archivos" }, { status: 400 })
    }

    if (files.length > MAX_FILES) {
      return Response.json(
        { error: `Maximo ${MAX_FILES} archivos por vez`, code: "MAX_FILES_EXCEEDED" },
        { status: 400 }
      )
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return Response.json(
          { error: `Tipo de archivo no soportado: ${file.type}`, code: "INVALID_FILE_TYPE" },
          { status: 400 }
        )
      }
      if (file.size > MAX_SIZE) {
        return Response.json(
          { error: `Archivo demasiado grande: ${file.name}`, code: "FILE_TOO_LARGE" },
          { status: 400 }
        )
      }
    }

    const session = await auth()
    const drive = session?.accessToken
      ? getDriveClient(session.accessToken)
      : getOwnerDriveClient()

    const dateStr = getDateStr()
    const { folderId: dateFolderId } = await getOrCreateDateFolder(drive, folderId, dateStr)

    const uploaded = []
    for (const file of files) {
      const buffer = await file.arrayBuffer()
      const result = await uploadPhoto(drive, dateFolderId, {
        name: file.name,
        mimeType: file.type,
        buffer,
      })
      uploaded.push(result)
    }

    return Response.json({ uploaded }, { status: 201 })
  } catch (error: any) {
    console.error("POST /upload error:", error)
    const message = error?.message || error?.toString() || "Error al subir archivos"
    return Response.json({ error: message, code: "UPLOAD_ERROR" }, { status: 500 })
  }
}
