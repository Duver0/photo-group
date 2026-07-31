"use client"

import { useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const GOLD = "#D4AF37"
const INK = "#1A1A1A"

type QrDisplayProps = {
  rootFolderId: string
  baseUrl: string
}

export function QrDisplay({ rootFolderId, baseUrl }: QrDisplayProps) {
  const uploadUrl = `${baseUrl}/upload?folder=${rootFolderId}`
  const svgRef = useRef<SVGSVGElement>(null)

  function downloadQr() {
    const svg = svgRef.current
    if (!svg) return

    const svgClone = svg.cloneNode(true) as SVGSVGElement
    const size = 800
    const padding = 40
    const canvasSize = size + padding * 2

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
    <div className="flex flex-col items-center gap-5 p-8">
      <div className="bg-[#1A1A1A] rounded-2xl p-4">
        <QRCodeSVG
          ref={svgRef}
          id="qr-code"
          value={uploadUrl}
          size={220}
          level="H"
          marginSize={4}
          fgColor={GOLD}
          bgColor={INK}
          style={{ display: "block" }}
        />
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
    </div>
  )
}
