import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { RealmContext } from '@virtuoso.dev/gurx'

import type { Realm } from '@virtuoso.dev/gurx'

/**
 * Realm → React bridge. gurx's `RealmProvider` types `initWith`/`updateWith`
 * as `Record<string, unknown>`, but the `Realm` constructor and `pubIn` are
 * symbol-keyed (`NodeRef` is a branded symbol). The owning component creates
 * the realm (so it can also reach it for the imperative handle) and passes it
 * in; this bridge only publishes prop updates and provides context.
 */

export interface SystemProviderProps {
  /** Realm created by the list component; one per mounted list instance. */
  realm: Realm
  /** Symbol-keyed values re-published whenever the record identity changes. */
  updates: Record<symbol, unknown>
  children: ReactNode
}

export function SystemProvider({ realm, updates, children }: SystemProviderProps) {
  useEffect(() => {
    realm.pubIn(updates)
  }, [realm, updates])

  return <RealmContext.Provider value={realm}>{children}</RealmContext.Provider>
}
