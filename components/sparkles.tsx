"use client"

import { useMemo, type CSSProperties } from "react"

const STAR_PATH =
  "M12 0c1.1 6.4 5.6 10.9 12 12-6.4 1.1-10.9 5.6-12 12-1.1-6.4-5.6-10.9-12-12C6.4 10.9 10.9 6.4 12 0z"

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type SparkleStyle = CSSProperties & {
  "--duration"?: string
  "--delay"?: string
  "--drift"?: string
  "--peak"?: number
}

type Sparkle = {
  left: string
  size: number
  duration: number
  delay: number
  drift: number
  peak: number
  star: boolean
}

export function Sparkles({ count = 16 }: { count?: number }) {
  const sparkles = useMemo<Sparkle[]>(() => {
    const rand = mulberry32(1337)
    return Array.from({ length: count }, (_, i) => ({
      left: `${rand() * 100}%`,
      size: 2 + rand() * 3,
      duration: 11 + rand() * 9,
      delay: -(rand() * 20),
      drift: (rand() - 0.5) * 120,
      peak: 0.12 + rand() * 0.22,
      star: i % 4 === 0,
    }))
  }, [count])

  return (
    <div className="sparkle-layer" aria-hidden>
      {sparkles.map((s, i) =>
        s.star ? (
          <svg
            key={i}
            className="sparkle text-gold"
            viewBox="0 0 24 24"
            style={
              {
                left: s.left,
                width: s.size * 3.2,
                height: s.size * 3.2,
                "--duration": `${s.duration}s`,
                "--delay": `${s.delay}s`,
                "--drift": `${s.drift}px`,
                "--peak": s.peak,
              } as SparkleStyle
            }
          >
            <path d={STAR_PATH} fill="currentColor" />
          </svg>
        ) : (
          <span
            key={i}
            className="sparkle rounded-full bg-gold"
            style={
              {
                left: s.left,
                width: s.size,
                height: s.size,
                "--duration": `${s.duration}s`,
                "--delay": `${s.delay}s`,
                "--drift": `${s.drift}px`,
                "--peak": s.peak,
                filter: "blur(0.6px)",
              } as SparkleStyle
            }
          />
        )
      )}
    </div>
  )
}
