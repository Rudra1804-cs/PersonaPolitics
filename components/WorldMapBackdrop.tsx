"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function WorldMapBackdrop() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12
      const y = (e.clientY / window.innerHeight - 0.5) * 12
      setMousePos({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [prefersReducedMotion])

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[-1] opacity-20"
      animate={
        prefersReducedMotion
          ? {}
          : {
              x: mousePos.x,
              y: mousePos.y,
            }
      }
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
    >
      <svg viewBox="0 0 1000 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <motion.stop
              offset="0%"
              stopColor="#3b82f6"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      stopOpacity: [0.3, 0.5, 0.3],
                    }
              }
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            <motion.stop
              offset="50%"
              stopColor="#8b5cf6"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      stopOpacity: [0.4, 0.6, 0.4],
                    }
              }
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            <motion.stop
              offset="100%"
              stopColor="#06b6d4"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      stopOpacity: [0.3, 0.5, 0.3],
                    }
              }
              transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
          </linearGradient>
        </defs>

        {/* Simplified world map paths */}
        <g fill="url(#mapGradient)" stroke="none">
          {/* North America */}
          <path d="M 150 100 L 200 80 L 250 90 L 280 120 L 270 160 L 240 180 L 200 170 L 160 150 Z" />
          <path d="M 180 180 L 220 190 L 240 220 L 220 240 L 180 230 Z" />

          {/* South America */}
          <path d="M 240 260 L 270 250 L 290 280 L 280 320 L 260 340 L 240 330 L 230 300 Z" />

          {/* Europe */}
          <path d="M 480 100 L 520 90 L 550 110 L 540 140 L 510 150 L 480 130 Z" />

          {/* Africa */}
          <path d="M 500 180 L 540 170 L 570 200 L 560 260 L 530 290 L 500 280 L 490 230 Z" />

          {/* Asia */}
          <path d="M 600 80 L 680 70 L 750 90 L 780 120 L 760 160 L 720 180 L 660 170 L 620 140 Z" />
          <path d="M 650 190 L 700 180 L 730 210 L 710 240 L 670 230 Z" />

          {/* Australia */}
          <path d="M 780 300 L 820 290 L 850 310 L 840 340 L 800 350 L 770 330 Z" />
        </g>

        {/* City dots with blinking animation */}
        {!prefersReducedMotion && (
          <>
            {[
              { cx: 200, cy: 140, delay: 0 },
              { cx: 260, cy: 290, delay: 0.5 },
              { cx: 510, cy: 120, delay: 1 },
              { cx: 530, cy: 230, delay: 1.5 },
              { cx: 700, cy: 130, delay: 2 },
              { cx: 810, cy: 320, delay: 2.5 },
            ].map((dot, i) => (
              <motion.circle
                key={i}
                cx={dot.cx}
                cy={dot.cy}
                r="3"
                fill="#fbbf24"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: dot.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
      </svg>
    </motion.div>
  )
}
