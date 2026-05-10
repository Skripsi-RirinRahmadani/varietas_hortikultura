"use client"
import * as React from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) return (
    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
  )

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 active:scale-90 group overflow-hidden"
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {resolvedTheme === "dark" ? (
          <motion.span
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="material-symbols-outlined text-[22px] pointer-events-none"
            data-icon="dark_mode"
          >
            dark_mode
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="material-symbols-outlined text-[22px] pointer-events-none"
            data-icon="light_mode"
          >
            light_mode
          </motion.span>
        )}
      </AnimatePresence>
      
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-green-400/0 group-hover:bg-green-400/5 transition-colors duration-300" />
    </button>
  )
}
