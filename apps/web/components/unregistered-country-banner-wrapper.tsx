'use client'

import { useAuth } from './auth-provider'
import UnregisteredCountryBanner from './unregistered-country-banner'

export default function UnregisteredCountryBannerWrapper() {
  const { user, loading } = useAuth()

  if (loading || user) return null

  return <UnregisteredCountryBanner />
}
