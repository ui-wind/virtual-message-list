import { setSize$ } from './size-system'
import { viewportHeight$ } from './viewport-system'

import type { Realm } from '@virtuoso.dev/gurx'

/**
 * Measurement system: ResizeObserver wiring for item and viewport sizing.
 * Item observations publish into `setSize$`; viewport observations publish
 * into `viewportHeight$`. Tests drive these cells directly via TestingContext,
 * so observers are only needed in the browser.
 */

/** Create an observer that publishes item sizes into `setSize$`. */
export function createItemObserver(realm: Realm): ResizeObserver {
  return new ResizeObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement & { dataset: DOMStringMap }
      const raw = el.dataset.index
      if (raw === undefined) continue
      const index = Number(raw)
      if (Number.isNaN(index)) continue
      const size = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
      realm.pub(setSize$, { index, size })
    }
  })
}

/** Create an observer that publishes viewport height into `viewportHeight$`. */
export function createViewportObserver(realm: Realm): ResizeObserver {
  return new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
    realm.pub(viewportHeight$, height)
  })
}
