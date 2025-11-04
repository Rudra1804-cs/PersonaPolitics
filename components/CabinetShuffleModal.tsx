"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/lib/state"
import { Button } from "@/components/ui/button"

export function CabinetShuffleModal() {
  const modalState = useGameStore((state) => state.cabinetShuffleModal)
  const shuffleCabinet = useGameStore((state) => state.shuffleCabinet)

  if (!modalState) return null

  return (
    <AnimatePresence>
      {modalState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md space-y-6 rounded-xl bg-slate-800 p-8 text-center shadow-2xl border border-slate-700"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Cabinet Shuffle</h2>
              <p className="text-lg text-slate-300">
                <span className="font-semibold text-rose-300">{modalState.ministerName}</span> resigned.
              </p>
              <p className="text-sm text-slate-400">Interim replacement appointed.</p>
            </div>

            <Button onClick={shuffleCabinet} size="lg" className="w-full">
              Acknowledge
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
