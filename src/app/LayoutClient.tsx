'use client'

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/Header"

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [showHeader, setShowHeader] = useState(true)

  useEffect(() => {
    setShowHeader(!pathname.startsWith('/admin'))
  }, [pathname])

  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  )
}
