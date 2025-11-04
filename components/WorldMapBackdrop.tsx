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
      const x = (e.clientX / window.innerWidth - 0.5) * 8
      const y = (e.clientY / window.innerHeight - 0.5) * 8
      setMousePos({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [prefersReducedMotion])

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-blue-950/80 to-slate-900/90" />

      {/* Oval Office desk silhouette at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 opacity-10">
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          <ellipse cx="600" cy="150" rx="400" ry="80" fill="#1e293b" opacity="0.6" />
          <rect x="200" y="130" width="800" height="70" rx="10" fill="#0f172a" />
          <rect x="550" y="100" width="100" height="30" rx="5" fill="#1e293b" />
        </svg>
      </div>

      <motion.div
        className="absolute inset-0 opacity-15"
        animate={
          prefersReducedMotion
            ? {}
            : {
                x: mousePos.x,
                y: mousePos.y,
              }
        }
        transition={{ type: "spring", stiffness: 40, damping: 25 }}
      >
        <svg viewBox="0 0 1200 600" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop
                offset="0%"
                stopColor="#3b82f6"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        stopOpacity: [0.4, 0.7, 0.4],
                      }
                }
                transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <motion.stop
                offset="50%"
                stopColor="#06b6d4"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        stopOpacity: [0.5, 0.8, 0.5],
                      }
                }
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <motion.stop
                offset="100%"
                stopColor="#0ea5e9"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        stopOpacity: [0.4, 0.7, 0.4],
                      }
                }
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Enhanced world map with more detailed continents */}
          <g fill="url(#mapGradient)" stroke="#3b82f6" strokeWidth="0.5" filter="url(#glow)">
            {/* North America - More detailed */}
            <path d="M 180 120 L 200 100 L 230 95 L 260 100 L 285 110 L 300 130 L 310 150 L 305 170 L 290 185 L 270 195 L 250 200 L 230 195 L 210 185 L 195 170 L 185 150 Z" />
            <path d="M 210 200 L 240 210 L 260 230 L 270 250 L 265 270 L 245 280 L 220 275 L 200 260 L 195 240 Z" />
            <path d="M 240 120 L 260 115 L 275 125 L 270 140 L 255 145 L 245 135 Z" />

            {/* South America - Enhanced */}
            <path d="M 270 290 L 295 280 L 315 285 L 330 305 L 335 330 L 330 360 L 315 385 L 295 395 L 275 390 L 260 370 L 255 340 L 260 310 Z" />

            {/* Europe - More detailed */}
            <path d="M 550 130 L 570 120 L 595 118 L 615 125 L 625 140 L 620 160 L 605 170 L 585 172 L 565 165 L 555 150 Z" />
            <path d="M 580 175 L 600 170 L 615 180 L 610 195 L 590 200 L 575 190 Z" />

            {/* Africa - Enhanced detail */}
            <path d="M 570 200 L 595 190 L 620 195 L 640 210 L 650 235 L 655 265 L 650 295 L 635 325 L 615 345 L 590 350 L 570 345 L 555 325 L 550 295 L 555 260 L 560 230 Z" />

            {/* Middle East */}
            <path d="M 630 180 L 655 175 L 675 185 L 680 205 L 670 220 L 650 225 L 635 215 Z" />

            {/* Asia - More detailed */}
            <path d="M 690 110 L 720 100 L 760 95 L 800 100 L 840 115 L 870 135 L 885 160 L 880 185 L 860 205 L 830 215 L 790 220 L 750 215 L 720 200 L 700 180 L 690 155 Z" />
            <path d="M 750 225 L 780 220 L 810 230 L 825 250 L 820 275 L 795 285 L 765 280 L 745 265 Z" />
            <path d="M 830 220 L 860 215 L 885 225 L 895 245 L 885 265 L 860 270 L 840 260 Z" />

            {/* Southeast Asia */}
            <path d="M 830 285 L 850 280 L 870 290 L 875 310 L 865 325 L 845 330 L 825 320 Z" />

            {/* Australia - Enhanced */}
            <path d="M 900 350 L 930 340 L 965 345 L 990 360 L 995 385 L 985 410 L 960 425 L 930 430 L 900 420 L 880 400 L 875 375 Z" />

            {/* Antarctica suggestion */}
            <path
              d="M 200 520 L 400 510 L 600 515 L 800 510 L 1000 520 L 950 545 L 700 555 L 450 550 L 250 545 Z"
              opacity="0.3"
            />
          </g>

          {/* Grid lines for game aesthetic */}
          <g stroke="#3b82f6" strokeWidth="0.3" opacity="0.2">
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 50} x2="1200" y2={i * 50} />
            ))}
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" />
            ))}
          </g>

          {/* Major cities with enhanced blinking animation */}
          {!prefersReducedMotion && (
            <>
              {[
                { cx: 240, cy: 160, delay: 0, label: "DC" },
                { cx: 285, cy: 310, delay: 0.3, label: "Brasília" },
                { cx: 590, cy: 155, delay: 0.6, label: "London" },
                { cx: 610, cy: 280, delay: 0.9, label: "Cairo" },
                { cx: 665, cy: 200, delay: 1.2, label: "Moscow" },
                { cx: 800, cy: 170, delay: 1.5, label: "Beijing" },
                { cx: 870, cy: 250, delay: 1.8, label: "Tokyo" },
                { cx: 950, cy: 390, delay: 2.1, label: "Sydney" },
              ].map((city, i) => (
                <g key={i}>
                  <motion.circle
                    cx={city.cx}
                    cy={city.cy}
                    r="4"
                    fill="#fbbf24"
                    stroke="#fef3c7"
                    strokeWidth="1"
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: city.delay,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.circle
                    cx={city.cx}
                    cy={city.cy}
                    r="8"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="0.5"
                    animate={{
                      opacity: [0, 0.6, 0],
                      scale: [0.5, 2, 2.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: city.delay,
                      ease: "easeOut",
                    }}
                  />
                </g>
              ))}
            </>
          )}

          {/* Connection lines between major cities */}
          {!prefersReducedMotion && (
            <g stroke="#3b82f6" strokeWidth="0.5" opacity="0.2">
              <motion.line
                x1="240"
                y1="160"
                x2="590"
                y2="155"
                animate={{ strokeDashoffset: [0, -100] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                strokeDasharray="5,5"
              />
              <motion.line
                x1="590"
                y1="155"
                x2="800"
                y2="170"
                animate={{ strokeDashoffset: [0, -100] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                strokeDasharray="5,5"
              />
              <motion.line
                x1="800"
                y1="170"
                x2="870"
                y2="250"
                animate={{ strokeDashoffset: [0, -100] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                strokeDasharray="5,5"
              />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  )
}
