import { Cell } from '@virtuoso.dev/gurx'

import { findMaxKeyValue } from '../utils/a-a-tree'
import { scrollTop$ } from './dom-system'
import { itemCount$, offsetTree$ } from './size-system'
import { increaseViewportBy$, viewportHeight$ } from './viewport-system'

import type { AANode } from '../utils/a-a-tree'

/**
 * Range system: the inclusive index window currently rendered, expanded by
 * `increaseViewportBy$` overscan on both sides.
 */

export interface VisibleRange {
  start: number
  end: number
}

function buildRange(offsets: AANode<number>, count: number, scrollTop: number, viewportHeight: number, overscan: number): VisibleRange {
  if (count === 0) {
    return { end: 0, start: 0 }
  }

  const overscannedTop = Math.max(0, scrollTop - overscan)
  const overscannedBottom = scrollTop + viewportHeight + overscan

  const [rawStart] = findMaxKeyValue(offsets, overscannedTop, 'v')
  const [rawEnd] = findMaxKeyValue(offsets, overscannedBottom, 'v')

  const start = rawStart === -Infinity ? 0 : rawStart
  const end = rawEnd === -Infinity ? 0 : rawEnd

  return {
    end: Math.min(end, count - 1),
    start: Math.min(start, count - 1),
  }
}

/** Inclusive visible range plus overscan, clamped to the data bounds. */
export const visibleRange$ = Cell<VisibleRange>({ end: 0, start: 0 }, (r) => {
  r.changeWith(
    visibleRange$,
    r.combine(offsetTree$, itemCount$, scrollTop$, viewportHeight$, increaseViewportBy$),
    (_cur, [offsets, count, top, viewport, overscan]) => buildRange(offsets, count, top, viewport, overscan)
  )
})
