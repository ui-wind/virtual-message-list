import { Cell } from '@virtuoso.dev/gurx'

import { findMaxKeyValue } from '../utils/a-a-tree'
import { scrollTop$ } from './dom-system'
import { bottomOffset$, isAtBottom$ } from './is-at-bottom-system'
import { defaultItemSize$, itemCount$, listHeight$, offsetOfIndex, offsetTree$, sizeAtIndex, sizeTree$ } from './size-system'
import { viewportHeight$ } from './viewport-system'

import type { ListScrollLocation } from '../dataTypes'
import type { AANode } from '../utils/a-a-tree'

/**
 * Scroll-location system: the single `ListScrollLocation` snapshot consumed by
 * `onScroll`, `getScrollLocation`, and the autoscroll policy. Derived from the
 * authoritative offsets/sizes plus the current scroll position.
 */

function buildLocation(
  offsets: AANode<number>,
  sizes: AANode<number>,
  count: number,
  defaultSize: number,
  scrollTop: number,
  viewportHeight: number,
  scrollHeight: number,
  bottom: number,
  atBottom: boolean
): ListScrollLocation {
  const base = {
    bottomOffset: bottom,
    isAtBottom: atBottom,
    // `-scrollTop || 0` avoids surfacing `-0` when scrollTop is exactly 0.
    listOffset: -scrollTop || 0,
    scrollHeight,
    visibleListHeight: viewportHeight,
  }

  if (count === 0) {
    return { ...base, lastItemBottomOffset: 0, lastVisibleItemIndex: 0 }
  }

  const viewportBottom = scrollTop + viewportHeight
  const [rawIndex] = findMaxKeyValue(offsets, viewportBottom, 'v')
  const index = rawIndex === -Infinity ? 0 : Math.min(rawIndex, count - 1)
  const itemBottom = offsetOfIndex(offsets, index) + sizeAtIndex(sizes, index, defaultSize)

  return { ...base, lastItemBottomOffset: itemBottom - viewportBottom, lastVisibleItemIndex: index }
}

const initialLocation: ListScrollLocation = {
  bottomOffset: 0,
  isAtBottom: true,
  lastItemBottomOffset: 0,
  lastVisibleItemIndex: 0,
  listOffset: 0,
  scrollHeight: 0,
  visibleListHeight: 0,
}

/** Authoritative scroll-location snapshot. */
export const listScrollLocation$ = Cell<ListScrollLocation>(initialLocation, (r) => {
  r.changeWith(
    listScrollLocation$,
    r.combine(offsetTree$, sizeTree$, itemCount$, defaultItemSize$, scrollTop$, viewportHeight$, listHeight$, bottomOffset$, isAtBottom$),
    (_cur, [offsets, sizes, count, defaultSize, top, viewport, height, bottom, atBottom]) =>
      buildLocation(offsets, sizes, count, defaultSize, top, viewport, height, bottom, atBottom)
  )
})
