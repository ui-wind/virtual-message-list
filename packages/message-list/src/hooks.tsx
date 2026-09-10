import * as React from 'react'

import { useCellValues } from '@virtuoso.dev/gurx'

import { data$ } from './systems/data-system'
import { visibleRange$ } from './systems/range-system'
import { listScrollLocation$ } from './systems/scroll-location-system'

import type { ListScrollLocation, VirtuosoMessageListMethods } from './dataTypes'

/**
 * Carries the imperative `VirtuosoMessageListMethods` to descendant components so
 * they can call `useVirtuosoMethods()` without a forwarded ref. Provided once by
 * the list component; scroll location and rendered data do NOT flow through here
 * because they are reactive — the corresponding hooks read the realm cells directly.
 */
const MethodsContext = React.createContext<VirtuosoMessageListMethods<unknown, unknown> | null>(null)

export function MethodsProvider({
  methods,
  children,
}: {
  methods: VirtuosoMessageListMethods<unknown, unknown>
  children: React.ReactNode
}) {
  return <MethodsContext.Provider value={methods}>{children}</MethodsContext.Provider>
}

/** Access the message list imperative methods from a descendant component. */
export function useVirtuosoMethods<Data = unknown, Context = unknown>(): VirtuosoMessageListMethods<Data, Context> {
  // The context stores the erased `<unknown, unknown>` methods; the consumer
  // re-narrow to its own Data/Context, mirroring the ref-based public type.
  // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic context boundary (erasure → consumer type)
  const value = React.useContext(MethodsContext) as VirtuosoMessageListMethods<Data, Context> | null
  if (!value) {
    throw new Error('useVirtuosoMethods must be used within a VirtuosoMessageList subtree')
  }
  return value
}

/** Access the current scroll location of the message list from a descendant component. */
export function useVirtuosoLocation(): ListScrollLocation {
  const [location] = useCellValues(listScrollLocation$)
  return location
}

/** Access the data items currently rendered by the message list window. */
export function useCurrentlyRenderedData<Data>(): Data[] {
  const [range, items] = useCellValues(visibleRange$, data$)
  if (items.length === 0) {
    return []
  }
  const start = Math.min(range.start, items.length - 1)
  const end = Math.min(range.end, items.length - 1)
  // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- the realm erases Data; items are the caller's Data at runtime
  return items.slice(start, end + 1) as Data[]
}
