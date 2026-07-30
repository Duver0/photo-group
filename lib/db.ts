const DB_NAME = "photo-group"
const STORE_NAME = "pending-photos"
const DB_VERSION = 1

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export type StoredPhoto = {
  id: string
  name: string
  type: string
  data: ArrayBuffer
}

export async function savePhotos(photos: StoredPhoto[]) {
  const db = await open()
  const tx = db.transaction(STORE_NAME, "readwrite")
  const store = tx.objectStore(STORE_NAME)

  store.clear()

  for (const photo of photos) {
    store.put(photo)
  }

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadPhotos(): Promise<StoredPhoto[]> {
  const db = await open()
  const tx = db.transaction(STORE_NAME, "readonly")
  const store = tx.objectStore(STORE_NAME)
  const req = store.getAll()

  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function clearPhotos() {
  const db = await open()
  const tx = db.transaction(STORE_NAME, "readwrite")
  const store = tx.objectStore(STORE_NAME)
  store.clear()

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
