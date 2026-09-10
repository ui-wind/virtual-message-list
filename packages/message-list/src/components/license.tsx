import * as React from 'react'

/**
 * Provides a license key to nested `VirtuosoMessageList` instances. Wrap all message
 * lists (individually or at a common ancestor). Leaving `licenseKey` empty runs in
 * trial mode.
 */
export function VirtuosoMessageListLicense({ licenseKey, children }: { licenseKey: string; children: React.ReactNode }) {
  const value = React.useMemo(() => ({ licenseKey }), [licenseKey])
  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>
}

export interface LicenseContextValue {
  licenseKey: string
}

export const LicenseContext = React.createContext<LicenseContextValue | undefined>(undefined)

export function useLicenseKey(): string | undefined {
  return React.useContext(LicenseContext)?.licenseKey
}
