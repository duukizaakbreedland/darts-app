import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

/**
 * App-shell voor de hoofdtabbladen: exact schermhoog, content scrollt intern,
 * de onderbalk staat altijd onderaan en is op elk tabblad identiek.
 */
export function TabScreen({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-svh bg-slate-900">
      <div className="flex-1 overflow-y-auto px-5 gap-6 flex flex-col pb-6 pt-[calc(env(safe-area-inset-top)_+_1.5rem)]">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
