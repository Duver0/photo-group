const UPLOAD_URL = "https://photo-group-flame.vercel.app/api/drive/upload"
const FOLDER_ID = process.env.FOLDER_ID
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "5")
const TOTAL_REQUESTS = parseInt(process.env.REQUESTS || "25")

if (!FOLDER_ID) {
  console.error("Uso: FOLDER_ID=<id> bun run scripts/load-test.mjs")
  console.error("Obten el FOLDER_ID del dashboard (esta en el QR)")
  process.exit(1)
}

function generateImage(size = 50_000) {
  const buffer = Buffer.alloc(size, 0)
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(Math.random() * 256)
  }
  return new Blob([buffer], { type: "image/jpeg" })
}

async function singleUpload(id) {
  const form = new FormData()
  const file = generateImage()
  form.append("files", file, `test-${id}.jpg`)
  form.append("folderId", FOLDER_ID)

  const start = performance.now()
  const res = await fetch(UPLOAD_URL, { method: "POST", body: form })
  const duration = performance.now() - start
  const ok = res.ok
  let data
  try { data = await res.json() } catch { data = null }

  return { id, ok, status: res.status, duration: Math.round(duration), error: data?.error }
}

async function run() {
  console.log(`\n=== Load Test ===`)
  console.log(`URL:        ${UPLOAD_URL}`)
  console.log(`Concurrency: ${CONCURRENCY}`)
  console.log(`Requests:    ${TOTAL_REQUESTS}`)
  console.log(`File size:   50KB`)
  console.log("")

  const all = []
  const startTotal = performance.now()

  for (let batch = 0; batch < TOTAL_REQUESTS; batch += CONCURRENCY) {
    const chunk = []
    const count = Math.min(CONCURRENCY, TOTAL_REQUESTS - batch)
    for (let i = 0; i < count; i++) {
      chunk.push(singleUpload(batch + i))
    }
    const results = await Promise.all(chunk)
    all.push(...results)
    process.stdout.write(`\rProgreso: ${Math.min(batch + count, TOTAL_REQUESTS)}/${TOTAL_REQUESTS}`)
  }

  const totalDuration = (performance.now() - startTotal) / 1000
  const success = all.filter(r => r.ok).length
  const failed = all.filter(r => !r.ok).length
  const durations = all.map(r => r.duration).sort((a, b) => a - b)
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length
  const p50 = durations[Math.floor(durations.length * 0.5)]
  const p95 = durations[Math.floor(durations.length * 0.95)]
  const p99 = durations[Math.floor(durations.length * 0.99)]

  console.log("\n\n=== Resultados ===")
  console.log(`Tiempo total:    ${totalDuration.toFixed(1)}s`)
  console.log(`Solicitudes:     ${TOTAL_REQUESTS}`)
  console.log(`Concurrencia:    ${CONCURRENCY}`)
  console.log(`Exitosas:        ${success}`)
  console.log(`Fallidas:        ${failed}`)
  console.log(`Tasa:            ${(TOTAL_REQUESTS / totalDuration).toFixed(1)} req/s`)
  console.log(`Latencia avg:    ${avg.toFixed(0)}ms`)
  console.log(`Latencia p50:    ${p50}ms`)
  console.log(`Latencia p95:    ${p95}ms`)
  console.log(`Latencia p99:    ${p99}ms`)
  if (failed > 0) {
    console.log("\nErrores:")
    const counts = {}
    all.filter(r => !r.ok).forEach(r => {
      const key = `${r.status}: ${r.error || "unknown"}`
      counts[key] = (counts[key] || 0) + 1
    })
    Object.entries(counts).forEach(([err, count]) => console.log(`  ${err} (${count}x)`))
  }
}

run().catch(console.error)
