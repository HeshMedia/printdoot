import type { ReactNode } from "react"

interface SectionHeaderProps {
  title: string
  description: string
  icon: ReactNode
}

export function SectionHeader({ title, description, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 rounded-xl bg-[#AFDDFF]">{icon}</div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  )
}

