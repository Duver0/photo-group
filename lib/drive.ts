import { google } from "googleapis"
import { Readable } from "stream"

export function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.drive({ version: "v3", auth })
}

export function getOwnerDriveClient() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  if (!refreshToken) throw new Error("GOOGLE_REFRESH_TOKEN no configurado")
  const auth = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
  )
  auth.setCredentials({ refresh_token: refreshToken })
  return google.drive({ version: "v3", auth })
}

export async function findRootFolder(drive: ReturnType<typeof getDriveClient>) {
  const res = await drive.files.list({
    q: "name='Photo-Group' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    spaces: "drive",
    fields: "files(id, name)",
  })
  return res.data.files && res.data.files.length > 0 ? res.data.files[0].id! : null
}

export async function getOrCreateRootFolder(drive: ReturnType<typeof getDriveClient>) {
  const res = await drive.files.list({
    q: "name='Photo-Group' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    spaces: "drive",
    fields: "files(id, name)",
  })

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!
  }

  const folder = await drive.files.create({
    requestBody: {
      name: "Photo-Group",
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  })

  return folder.data.id!
}

export async function uploadPhoto(
  drive: ReturnType<typeof getDriveClient>,
  folderId: string,
  file: { name: string; mimeType: string; buffer: ArrayBuffer }
) {
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const uniqueName = `${timestamp}-${sanitizedName}`

  const res = await drive.files.create({
    requestBody: {
      name: uniqueName,
      parents: [folderId],
      mimeType: file.mimeType,
    },
    media: {
      mimeType: file.mimeType,
      body: Readable.from(Buffer.from(file.buffer)),
    },
    fields: "id, name, mimeType, webViewLink, thumbnailLink, size, createdTime",
  })

  return res.data
}

export async function listPhotos(
  drive: ReturnType<typeof getDriveClient>,
  folderId: string
) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
    orderBy: "createdTime desc",
    fields: "files(id, name, mimeType, webViewLink, thumbnailLink, size, createdTime)",
    pageSize: 100,
  })

  return res.data.files || []
}
