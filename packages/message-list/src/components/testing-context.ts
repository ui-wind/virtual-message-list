import * as React from 'react'

import type { VirtuosoMessageListTestingContextValue } from '../types'

/**
 * A controlled testing environment for `VirtuosoMessageList`. When a value is
 * provided, the list skips its ResizeObserver measurements and instead drives the
 * viewport and item sizes from the context, making layout deterministic in tests.
 */
export const VirtuosoMessageListTestingContext = React.createContext<VirtuosoMessageListTestingContextValue | undefined>(undefined)

export function useTestingContext(): VirtuosoMessageListTestingContextValue | undefined {
  return React.useContext(VirtuosoMessageListTestingContext)
}
