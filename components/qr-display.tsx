"use client"

import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type QrDisplayProps = {
  rootFolderId: string
  baseUrl: string
}

export function QrDisplay({ rootFolderId, baseUrl }: QrDisplayProps) {
  const uploadUrl = `${baseUrl}/upload?folder=${rootFolderId}`

  function downloadQr() {
    const svg = document.getElementById("qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = 400
      canvas.height = 400
      ctx?.drawImage(img, 0, 0)
      const png = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = "photo-group-qr.png"
      link.href = png
      link.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <Card className="flex flex-col items-center gap-4 p-8">
      <QRCodeSVG
        id="qr-code"
        value={uploadUrl}
        size={256}
        level="M"
        includeMargin
      />
      <p className="text-sm text-zinc-500 text-center max-w-xs">
        Escanea este codigo QR para subir fotos
      </p>
      <Button variant="outline" size="sm" onClick={downloadQr}>
        Descargar QR
      </Button>
      <CardContent className="p-0">
        <p className="text-xs text-zinc-400 break-all text-center">{uploadUrl}</p>
      </CardContent>
    </Card>
  )
}
