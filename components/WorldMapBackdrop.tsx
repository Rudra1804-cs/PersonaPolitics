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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1930] via-[#0f3057] to-[#1b4b75]" />

      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 180,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full bg-gradient-radial from-blue-400/40 via-cyan-500/20 to-transparent blur-3xl" />
        </motion.div>
      )}

      {!prefersReducedMotion && (
        <div className="absolute inset-0 opacity-25">
          {Array.from({ length: 80 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: "blur(0.5px)",
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.9, 0.1],
                scale: [0.8, 1.8, 0.8],
              }}
              transition={{
                duration: 4 + Math.random() * 6,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 8,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-20">
        <svg viewBox="0 0 1200 240" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="deskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
            </linearGradient>
            <radialGradient id="deskGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Desk glow */}
          <ellipse cx="600" cy="180" rx="500" ry="100" fill="url(#deskGlow)" />
          {/* Main desk surface */}
          <ellipse cx="600" cy="190" rx="480" ry="95" fill="url(#deskGradient)" opacity="0.8" />
          <rect x="120" y="160" width="960" height="80" rx="15" fill="#0f172a" opacity="0.95" />
          {/* Presidential seal area */}
          <rect x="510" y="120" width="180" height="45" rx="8" fill="#1e293b" opacity="0.9" />
          {/* Desk lamps */}
          <circle cx="350" cy="175" r="10" fill="#3b82f6" opacity="0.7" />
          <circle cx="850" cy="175" r="10" fill="#3b82f6" opacity="0.7" />
          {/* Document stacks */}
          <rect x="200" y="165" width="60" height="8" rx="2" fill="#334155" opacity="0.6" />
          <rect x="940" y="165" width="60" height="8" rx="2" fill="#334155" opacity="0.6" />
        </svg>
      </div>

      <motion.div
        className="absolute inset-0 opacity-25"
        animate={
          prefersReducedMotion
            ? {}
            : {
                x: mousePos.x,
                y: mousePos.y,
              }
        }
        transition={{ type: "spring", stiffness: 25, damping: 25 }}
      >
        <svg viewBox="0 0 1400 700" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop
                offset="0%"
                stopColor="#06b6d4"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        stopOpacity: [0.6, 1, 0.6],
                      }
                }
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <motion.stop
                offset="50%"
                stopColor="#3b82f6"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        stopOpacity: [0.7, 1, 0.7],
                      }
                }
                transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <motion.stop
                offset="100%"
                stopColor="#0ea5e9"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        stopOpacity: [0.6, 1, 0.6],
                      }
                }
                transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g fill="url(#mapGradient)" stroke="#06b6d4" strokeWidth="2" filter="url(#glow)">
            {/* North America - More detailed */}
            <motion.path
              d="M 200 140 L 220 115 L 245 105 L 270 100 L 295 105 L 315 115 L 330 130 L 340 150 L 345 170 L 340 190 L 325 210 L 305 225 L 280 235 L 255 240 L 230 235 L 210 220 L 195 200 L 185 175 L 185 155 Z"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      strokeWidth: [2, 3.5, 2],
                      opacity: [0.75, 1, 0.75],
                    }
              }
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            {/* Central America */}
            <motion.path
              d="M 230 240 L 255 250 L 275 270 L 285 290 L 280 310 L 260 320 L 235 315 L 215 295 L 210 270 Z"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      strokeWidth: [2, 3.5, 2],
                      opacity: [0.75, 1, 0.75],
                    }
              }
              transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.8 }}
            />

            {/* South America - Enhanced detail */}
            <motion.path
              d="M 285 330 L 310 320 L 335 325 L 355 345 L 365 375 L 370 410 L 365 450 L 350 485 L 325 505 L 295 515 L 270 510 L 250 490 L 240 460 L 235 420 L 240 380 L 250 350 Z"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      strokeWidth: [2, 3.5, 2],
                      opacity: [0.75, 1, 0.75],
                    }
              }
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1.5 }}
            />

            {/* Europe - More detailed */}
            <motion.path
              d="M 640 150 L 665 140 L 690 138 L 715 142 L 735 155 L 745 175 L 740 195 L 725 210 L 700 218 L 675 220 L 650 212 L 635 195 L 630 175 Z"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      strokeWidth: [2, 3.5, 2],
                      opacity: [0.75, 1, 0.75],
                    }
              }
              transition={{ duration: 8.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }}
            />

            {/* Africa - Enhanced shape */}
            <motion.path
              d="M 660 230 L 690 218 L 720 222 L 745 238 L 760 265 L 770 300 L 775 340 L 770 380 L 755 420 L 730 455 L 700 480 L 670 490 L 640 485 L 615 465 L 600 435 L 590 395 L 590 350 L 595 305 L 605 265 L 620 240 Z"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      strokeWidth: [2, 3.5, 2],
                      opacity: [0.75, 1, 0.75],
                    }
              }
              transition={{ duration: 11, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2.5 }}
            />

            {/* Asia - More detailed */}
            <motion.path
              d="M 800 130 L 835 118 L 880 110 L 930 115 L 980 130 L 1020 155 L 1045 185 L 1055 220 L 1050 255 L 1030 285 L 995 310 L 950 325 L 900 330 L 850 325 L 810 310 L 780 285 L 765 255 L 760 220 L 770 185 L 785 160 Z"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      strokeWidth: [2, 3.5, 2],
                      opacity: [0.75, 1, 0.75],
                    }
              }
              transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 3 }}
            />

            {/* Australia - Enhanced */}
            <motion.path
              d="M 1050 420 L 1085 408 L 1125 412 L 1160 430 L 1175 460 L 1180 495 L 1170 530 L 1145 555 L 1110 570 L 1070 575 L 1035 565 L 1010 540 L 1000 505 L 1005 465 L 1020 435 Z"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      strokeWidth: [2, 3.5, 2],
                      opacity: [0.75, 1, 0.75],
                    }
              }
              transition={{ duration: 10.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 3.5 }}
            />
          </g>

          <g stroke="#06b6d4" strokeWidth="0.8" opacity="0.2">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.line
                key={`h${i}`}
                x1="0"
                y1={i * 50}
                x2="1400"
                y2={i * 50}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        opacity: [0.15, 0.35, 0.15],
                      }
                }
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
            {Array.from({ length: 28 }).map((_, i) => (
              <motion.line
                key={`v${i}`}
                x1={i * 50}
                y1="0"
                x2={i * 50}
                y2="700"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        opacity: [0.15, 0.35, 0.15],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
              />
            ))}
          </g>

          {!prefersReducedMotion && (
            <>
              {[
                { cx: 270, cy: 190, delay: 0, label: "Washington DC" },
                { cx: 320, cy: 380, delay: 0.5, label: "Brasília" },
                { cx: 690, cy: 180, delay: 1.0, label: "London" },
                { cx: 760, cy: 235, delay: 1.5, label: "Dubai" },
                { cx: 930, cy: 200, delay: 2.0, label: "Beijing" },
                { cx: 1010, cy: 290, delay: 2.5, label: "Tokyo" },
                { cx: 1110, cy: 490, delay: 3.0, label: "Sydney" },
                { cx: 650, cy: 350, delay: 3.5, label: "Johannesburg" },
              ].map((city, i) => (
                <g key={i} filter="url(#strongGlow)">
                  <motion.circle
                    cx={city.cx}
                    cy={city.cy}
                    r="6"
                    fill="#fbbf24"
                    stroke="#fef3c7"
                    strokeWidth="2.5"
                    animate={{
                      opacity: [0.6, 1, 0.6],
                      scale: [1, 2, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: city.delay,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.circle
                    cx={city.cx}
                    cy={city.cy}
                    r="15"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    animate={{
                      opacity: [0, 0.9, 0],
                      scale: [0.5, 3.5, 4],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: city.delay,
                      ease: "easeOut",
                    }}
                  />
                  <motion.circle
                    cx={city.cx}
                    cy={city.cy}
                    r="25"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1"
                    animate={{
                      opacity: [0, 0.6, 0],
                      scale: [0.3, 3, 3.5],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: city.delay + 0.7,
                      ease: "easeOut",
                    }}
                  />
                </g>
              ))}
            </>
          )}

          {!prefersReducedMotion && (
            <g stroke="#06b6d4" strokeWidth="2" filter="url(#glow)">
              <motion.line
                x1="270"
                y1="190"
                x2="690"
                y2="180"
                animate={{
                  strokeDashoffset: [0, -300],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                strokeDasharray="15,15"
              />
              <motion.line
                x1="690"
                y1="180"
                x2="760"
                y2="235"
                animate={{
                  strokeDashoffset: [0, -300],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 1.5 }}
                strokeDasharray="15,15"
              />
              <motion.line
                x1="760"
                y1="235"
                x2="930"
                y2="200"
                animate={{
                  strokeDashoffset: [0, -300],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 3 }}
                strokeDasharray="15,15"
              />
              <motion.line
                x1="930"
                y1="200"
                x2="1010"
                y2="290"
                animate={{
                  strokeDashoffset: [0, -300],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 4.5 }}
                strokeDasharray="15,15"
              />
              <motion.line
                x1="1010"
                y1="290"
                x2="1110"
                y2="490"
                animate={{
                  strokeDashoffset: [0, -300],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 6 }}
                strokeDasharray="15,15"
              />
            </g>
          )}
        </svg>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1930]/92 via-[#0a1930]/95 to-[#0a1930]/92 pointer-events-none" />
    </div>
  )
}
