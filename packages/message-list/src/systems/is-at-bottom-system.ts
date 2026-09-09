import { Cell, map } from '@virtuoso.dev/gurx'

import { BOTTOM_THRESHOLD_PX } from '../constants'
import { scrollTop$ } from './dom-system'
import { listHeight$ } from './size-system'
import { viewportHeight$ } from './viewport-system'

/**
 * Is-at-bottom system: bottom distance and the composite "at bottom" flag.
 * `scrollInProgress$` / `scrollToBottomInProgress$` are published by the
 * smooth-scroll system (Phase 5); until then they default to false.
 */

/** A smooth scroll is running (any target). */
export const scrollInProgress$ = Cell<boolean>(false)

/** A smooth scroll whose target is the bottom is running. */
export const scrollToBottomInProgress$ = Cell<boolean>(false)

const bottomOffsetDerived$ = Cell<number>(0, (r) => {
  r.changeWith(
    bottomOffsetDerived$,
    r.combine(listHeight$, viewportHeight$, scrollTop$),
    (_cur, [height, viewport, top]) => height - viewport - top
  )
})

/** Distance from the scroller bottom to the list bottom; `0` means flush. */
export const bottomOffset$ = Cell<number>(0, (r) => {
  r.link(bottomOffsetDerived$, bottomOffset$)
})

const atBottomPosition$ = Cell<boolean>(false, (r) => {
  r.link(
    r.pipe(
      bottomOffsetDerived$,
      map((offset) => offset <= BOTTOM_THRESHOLD_PX)
    ),
    atBottomPosition$
  )
})

/** True while at the bottom or smoothly scrolling toward it. */
export const isAtBottom$ = Cell<boolean>(false, (r) => {
  r.changeWith(isAtBottom$, r.combine(atBottomPosition$, scrollToBottomInProgress$), (_cur, [atPos, towardBottom]) => atPos || towardBottom)
})
