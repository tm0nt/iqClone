"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { resolveLogoForBackground } from '@shared/platform/branding'

export function Logo({
  width = 180,
  background = 'auto',
  onDataLoaded,
}: {
  width?: number
  background?: 'auto' | 'light' | 'dark'
  onDataLoaded?: (data: { logoUrl: string; name: string }) => void
}) {
  const [logoUrl, setLogoUrl] = useState('/nextbrokers.png')
  const [companyName, setCompanyName] = useState('Empresa')
  const onDataLoadedRef = useRef(onDataLoaded)
  onDataLoadedRef.current = onDataLoaded

  const fetchLogo = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/logo', { cache: 'no-store' })
      const data = await response.json()
      const logoDark = data.logoDark || data.logo
      const logoWhite = data.logoWhite || data.logo
      let logo: string
      if (background === 'light') {
        logo = logoDark || logoWhite || '/nextbrokers.png'
      } else if (background === 'dark') {
        logo = logoWhite || logoDark || '/nextbrokers.png'
      } else {
        logo = resolveLogoForBackground({
          backgroundColor: data.backgroundColor,
          logoDark,
          logoWhite,
          fallback: '/nextbrokers.png',
        })
      }
      const name = data.nome || 'Empresa'
      setLogoUrl(logo)
      setCompanyName(name)
      onDataLoadedRef.current?.({ logoUrl: logo, name })
    } catch {
      onDataLoadedRef.current?.({ logoUrl: '/nextbrokers.png', name: 'Empresa' })
    }
  }, [])

  useEffect(() => {
    fetchLogo()

    // Re-fetch whenever settings save a new logo
    const handler = () => fetchLogo()
    window.addEventListener('logoUpdated', handler)
    return () => window.removeEventListener('logoUpdated', handler)
  }, [fetchLogo])

  return (
    <div className="flex items-center">
      <img
        src={logoUrl}
        width={width}
        alt={`${companyName} logo`}
        className="max-w-full"
        onError={(e) => {
          // Avoid infinite loop: only fall back if not already the default
          if (e.currentTarget.src !== window.location.origin + '/nextbrokers.png') {
            e.currentTarget.src = '/nextbrokers.png'
          }
        }}
      />
    </div>
  )
}
