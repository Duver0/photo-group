"use client"

import { useEffect, useRef, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const GOLD = "#D4AF37"
const INK = "#1A1A1A"
const MARGIN = 4
const HEART_MODULES = 2.9
const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"

function getFinderCenters(numCells: number) {
  const count = numCells - MARGIN * 2
  const inner = MARGIN + 3.5
  const outer = MARGIN + count - 3.5
  return [
    { x: inner, y: inner },
    { x: outer, y: inner },
    { x: inner, y: outer },
  ]
}

function heartTransform(center: { x: number; y: number }, scale: number) {
  return `translate(${center.x} ${center.y}) scale(${scale}) translate(-12 -12)`
}

type QrDisplayProps = {
  rootFolderId: string
  baseUrl: string
}

export function QrDisplay({ rootFolderId, baseUrl }: QrDisplayProps) {
  const uploadUrl = `${baseUrl}/upload?folder=${rootFolderId}`
  const svgRef = useRef<SVGSVGElement>(null)
  const [numCells, setNumCells] = useState<number | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    setNumCells(svg.viewBox.baseVal.width)
  }, [])

  const modulePct = numCells ? 100 / numCells : 0
  const heartSizePct = HEART_MODULES * modulePct
  const centers = numCells ? getFinderCenters(numCells) : []

  function downloadQr() {
    const svg = svgRef.current
    if (!svg) return

    const svgClone = svg.cloneNode(true) as SVGSVGElement
    const size = 800
    const padding = 40
    const canvasSize = size + padding * 2

    if (numCells) {
      const ns = "http://www.w3.org/2000/svg"
      for (const center of getFinderCenters(numCells)) {
        const g = document.createElementNS(ns, "g")
        g.setAttribute("transform", heartTransform(center, HEART_MODULES / 24))
        const path = document.createElementNS(ns, "path")
        path.setAttribute("d", HEART_PATH)
        path.setAttribute("fill", INK)
        g.appendChild(path)
        svgClone.appendChild(g)
      }
    }

    const svgString = new XMLSerializer().serializeToString(svgClone)
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = canvasSize
      canvas.height = canvasSize
      const ctx = canvas.getContext("2d")!

      ctx.fillStyle = INK
      ctx.fillRect(0, 0, canvasSize, canvasSize)
      ctx.drawImage(img, padding, padding, size, size)

      const link = document.createElement("a")
      link.download = "photo-group-qr.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)))
  }

  return (
    <Card className="flex flex-col items-center gap-5 p-8">
      <div className="relative bg-[#1A1A1A] rounded-2xl p-4">
        <QRCodeSVG
          ref={svgRef}
          id="qr-code"
          value={uploadUrl}
          size={220}
          level="H"
          marginSize={MARGIN}
          fgColor={GOLD}
          bgColor={INK}
          style={{ display: "block" }}
        />
        {centers.map((center, i) => (
          <svg
            key={i}
            className="absolute"
            viewBox="0 0 24 24"
            style={{
              left: `${center.x * modulePct}%`,
              top: `${center.y * modulePct}%`,
              width: `${heartSizePct}%`,
              height: `${heartSizePct}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <path d={HEART_PATH} fill={INK} />
          </svg>
        ))}
      </div>
      <p className="text-sm text-cream/50 text-center max-w-xs">
        Escanea para compartir tus fotos
      </p>
      <Button variant="outline" size="sm" onClick={downloadQr}>
        Descargar QR
      </Button>
      <CardContent className="p-0">
        <p className="text-xs text-cream/30 break-all text-center max-w-full">{uploadUrl}</p>
      </CardContent>
    </Card>
  )
}
