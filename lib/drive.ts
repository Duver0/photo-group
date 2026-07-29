import { google } from "googleapis"

export function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.drive({ version: "v3", auth })
}

export function getServiceAccountClient() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!key) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY no configurada")
  const credentials = JSON.parse(key)
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  })
  return google.drive({ version: "v3", auth })
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

export async function getOrCreateDateFolder(
  drive: ReturnType<typeof getDriveClient>,
  rootFolderId: string,
  dateStr: string
) {
  const res = await drive.files.list({
    q: `name='${dateStr}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    spaces: "drive",
    fields: "files(id, name)",
  })

  if (res.data.files && res.data.files.length > 0) {
    return { folderId: res.data.files[0].id!, created: false }
  }

  const folder = await drive.files.create({
    requestBody: {
      name: dateStr,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    },
    fields: "id",
  })

  return { folderId: folder.data.id!, created: true }
}

export async function listDateFolders(drive: ReturnType<typeof getDriveClient>, rootFolderId: string) {
  const res = await drive.files.list({
    q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    orderBy: "createdTime desc",
    fields: "files(id, name, createdTime)",
    pageSize: 100,
  })

  return res.data.files || []
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
      body: Buffer.from(file.buffer),
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
