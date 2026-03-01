"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ShieldCheck, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BiasAuditToggleProps {
  onToggle: (enabled: boolean) => void
  enabled: boolean
}

export function BiasAuditToggle({ onToggle, enabled }: BiasAuditToggleProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {enabled ? (
            <motion.div
              key="anonymized"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-primary"
            >
              <ShieldCheck className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="normal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-muted-foreground"
            >
              <EyeOff className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
        <Label htmlFor="bias-audit" className="text-xs font-syne font-semibold cursor-pointer whitespace-nowrap">
          {enabled ? "BIAS AUDIT ACTIVE" : "BIAS AUDIT OFF"}
        </Label>
      </div>
      <Switch
        id="bias-audit"
        checked={enabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  )
}
