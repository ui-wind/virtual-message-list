import { Cell, Signal } from '@virtuoso.dev/gurx'

import type { ScrollBehavior } from '../dataTypes'

/**
 * DOM system: the element references the list needs, the authoritative scroll
 * offset, and the one-way request channel for imperative scroll commands. The
 * component reads `scrollTo$` and writes `scrollTop$`; everything else is state.
 */

/** The scrollable container element (`null` until mounted). */
export const scrollerElement$ = Cell<HTMLElement | null>(null)

/** The inner list element that carries the total content height. */
export const listElement$ = Cell<HTMLElement | null>(null)

/** Whether the list scrolls with the window rather than an internal scroller. */
export const useWindowScroll$ = Cell<boolean>(false)

/** User-supplied scroller element to observe instead of the internal one. */
export const customScrollParent$ = Cell<HTMLElement | null>(null)

/** Current vertical scroll offset, in pixels. The scroll handler publishes this. */
export const scrollTop$ = Cell<number>(0)

/** Request to scroll the container to an absolute offset with a given behavior. */
export const scrollTo$ = Signal<{ behavior: ScrollBehavior; top: number }>()

/** Resolve which element actually scrolls, given the current DOM inputs. */
export function resolveScrollContainer(
  customParent: HTMLElement | null,
  scroller: HTMLElement | null,
  windowScroll: boolean
): HTMLElement | Window | null {
  if (customParent) return customParent
  if (windowScroll) return typeof window !== 'undefined' ? window : null
  return scroller
}
