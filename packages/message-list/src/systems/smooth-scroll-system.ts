import { Action, Signal } from '@virtuoso.dev/gurx'

import { SMOOTH_SCROLL_DEFAULT_FRAMES } from '../constants'
import { clamp, easeInOutCubic, offsetForAlign } from '../utils/math'
import { normalizeLocation, resolveIndex } from '../utils/scroll-helpers'
import { scrollTo$, scrollerElement$, scrollTop$ } from './dom-system'
import { scrollInProgress$, scrollToBottomInProgress$ } from './is-at-bottom-system'
import { defaultItemSize$, itemCount$, listHeight$, offsetOfIndex, offsetTree$, setSize$, sizeAtIndex, sizeTree$ } from './size-system'
import { viewportHeight$ } from './viewport-system'

import type { BezierFunction, ItemLocation, ScrollBehavior } from '../dataTypes'
import type { Realm } from '@virtuoso.dev/gurx'

/** Idle window after which a pending bottom-follow is released. */
const BOTTOM_ANCHOR_SETTLE_MS = 600
/** Sub-pixel drift tolerated between commanded and observed scroll offsets. */
const SCROLL_TOLERANCE_PX = 2

/**
 * Smooth-scroll system: the rAF-driven animator that turns a scroll-to-location
 * request into a sequence of `scrollTo$` updates. It never touches the DOM
 * directly — the scroller component subscribes to `scrollTo$` and performs the
 * actual scroll. This system owns cancellation and the `scrollInProgress` /
 * `scrollToBottomInProgress` flags read by the is-at-bottom and autoscroll
 * systems, and keeps its animation state scoped per realm (no module globals).
 */

/** Request to scroll to a resolved item location. */
export interface ScrollToLocationRequest {
  location: ItemLocation
  /** Explicit behavior override; otherwise read from `location.behavior`. */
  behavior?: ScrollBehavior
  /** True when the request targets the bottom (drives `scrollToBottomInProgress$`). */
  isBottom?: boolean
}

/** Channel from the autoscroll / imperative layer into the animator. */
export const scrollToLocation$ = Signal<ScrollToLocationRequest>()
/** Cancels any in-flight animation. */
export const cancelSmoothScroll$ = Action()
/** Anchor correction published by the data flush when items are prepended. */
export const prependAnchor$ = Signal<{ addedCount: number; estimate: number }>()

/** Resolve an item location to an absolute, clamped scroll offset. */
function computeTargetTop(realm: Realm, location: ItemLocation): number {
  const normalized = normalizeLocation(location)
  const count = realm.getValue(itemCount$)
  if (count === 0) {
    return 0
  }
  const index = clamp(resolveIndex(normalized.index, count), 0, count - 1)
  const itemOffset = offsetOfIndex(realm.getValue(offsetTree$), index)
  const itemSize = sizeAtIndex(realm.getValue(sizeTree$), index, realm.getValue(defaultItemSize$))
  const viewport = realm.getValue(viewportHeight$)
  const height = realm.getValue(listHeight$)
  const align = normalized.align ?? 'start'
  // For a last-item / bottom request, the DOM's realized scroll range is the
  // source of truth: the layout estimate (`listHeight$`) can lag the height the
  // scroller will actually reach once newly added items paint, so anchoring to
  // `scrollHeight - clientHeight` guarantees we land on the true bottom.
  const bottomAnchor = normalized.index === 'LAST' && (align === 'end' || align === 'start-no-overflow')
  const el = bottomAnchor ? realm.getValue(scrollerElement$) : null
  if (el && el.scrollHeight > el.clientHeight) {
    return el.scrollHeight - el.clientHeight
  }
  const maxScroll = Math.max(0, height - viewport)
  return clamp(offsetForAlign(align, itemOffset, itemSize, viewport, height) + (normalized.offset ?? 0), 0, maxScroll)
}

/** True when a request anchors to the last item / the bottom of the list. */
function anchorsToBottom(realm: Realm, index: number | 'LAST', isBottom: boolean | undefined): boolean {
  if (isBottom === true) {
    return true
  }
  return index === 'LAST' && realm.getValue(itemCount$) > 0
}

/** Wire the animator into a realm. Animation state is local to this call. */
export function connectSmoothScrollSystem(realm: Realm): void {
  let rafId: number | null = null
  let commandedTop = 0

  // Pending bottom-follow. A bottom-anchored request is resolved against the
  // *estimated* layout during a data flush — before the ResizeObserver has
  // measured the newly added items — so `computeTargetTop` clamps it to 0 and the
  // list never scrolls when content first overflows. We keep the request pending
  // and re-issue it as measured sizes land (setSize$/listHeight$/viewportHeight$)
  // until the layout settles or the user scrolls away from the bottom.
  let pendingBottom: ScrollToLocationRequest | null = null
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let settling = false

  const clearPendingBottom = () => {
    pendingBottom = null
    if (settleTimer !== null) {
      clearTimeout(settleTimer)
      settleTimer = null
    }
  }

  const armSettleTimer = () => {
    if (settleTimer !== null) {
      clearTimeout(settleTimer)
    }
    settleTimer = setTimeout(clearPendingBottom, BOTTOM_ANCHOR_SETTLE_MS)
  }

  const cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    realm.pub(scrollInProgress$, false)
    realm.pub(scrollToBottomInProgress$, false)
  }

  // Land immediately, then settle state and report completion.
  const completeAt = (top: number, done: (() => void) | null) => {
    commandedTop = top
    realm.pub(scrollTop$, top)
    realm.pub(scrollTo$, { behavior: 'auto', top })
    realm.pub(scrollInProgress$, false)
    realm.pub(scrollToBottomInProgress$, false)
    if (done) {
      done()
    }
  }

  realm.sub(cancelSmoothScroll$, () => {
    clearPendingBottom()
    cancel()
  })

  // Prepend anchoring: shift the scroll offset down by the estimated height of
  // the newly prepended items so the previously-first item stays put on screen.
  realm.sub(prependAnchor$, ({ estimate }) => {
    if (estimate === 0) {
      return
    }
    const next = realm.getValue(scrollTop$) + estimate
    commandedTop = next
    realm.pub(scrollTop$, next)
    realm.pub(scrollTo$, { behavior: 'auto', top: next })
  })

  const perform = (req: ScrollToLocationRequest, honorDone: boolean) => {
    cancel()

    const normalized = normalizeLocation(req.location)
    const behavior: ScrollBehavior = req.behavior ?? normalized.behavior ?? 'auto'
    const targetTop = computeTargetTop(realm, req.location)
    const done = honorDone ? (normalized.done ?? null) : null

    const jump = () => {
      completeAt(targetTop, done)
    }

    // Non-animated behaviors land in a single step.
    if (behavior === 'auto' || behavior === 'instant') {
      jump()
      return
    }

    const startTop = realm.getValue(scrollTop$)
    const distance = targetTop - startTop

    // Resolve frames + easing: 'smooth' uses the built-in curve, a function
    // supplies its own.
    let frames = SMOOTH_SCROLL_DEFAULT_FRAMES
    let easing: BezierFunction = easeInOutCubic
    if (typeof behavior === 'function') {
      const custom = behavior(startTop, targetTop)
      frames = custom.animationFrameCount
      easing = custom.easing
    }

    if (distance === 0 || frames <= 0) {
      jump()
      return
    }

    realm.pub(scrollInProgress$, true)
    if (req.isBottom === true) {
      realm.pub(scrollToBottomInProgress$, true)
    }

    let frame = 0
    const step = () => {
      frame += 1
      const t = Math.min(1, frame / frames)
      const current = startTop + distance * easing(t)
      commandedTop = current
      realm.pub(scrollTop$, current)
      realm.pub(scrollTo$, { behavior: 'auto', top: current })
      if (frame < frames) {
        rafId = requestAnimationFrame(step)
        return
      }
      rafId = null
      realm.pub(scrollInProgress$, false)
      realm.pub(scrollToBottomInProgress$, false)
      if (done) {
        done()
      }
    }

    rafId = requestAnimationFrame(step)
  }

  realm.sub(scrollToLocation$, (req) => {
    perform(req, true)

    const normalized = normalizeLocation(req.location)
    if (anchorsToBottom(realm, normalized.index, req.isBottom)) {
      // Drop the one-shot done callback so re-issuing the follow never re-fires it.
      const { done: _done, ...location } = normalized
      pendingBottom = { location }
      if (req.behavior !== undefined) {
        pendingBottom.behavior = req.behavior
      }
      if (req.isBottom !== undefined) {
        pendingBottom.isBottom = req.isBottom
      }
      armSettleTimer()
      return
    }
    clearPendingBottom()
  })

  // Re-resolve a pending bottom-follow whenever the layout moves underneath it.
  // Measured item sizes arrive asynchronously (ResizeObserver) after the flush, so
  // this is what actually scrolls a list that has just transitioned to overflowing.
  const reAnchor = () => {
    if (!pendingBottom || settling) {
      return
    }
    settling = true
    try {
      perform({ ...pendingBottom, isBottom: pendingBottom.isBottom ?? true }, false)
      armSettleTimer()
    } finally {
      settling = false
    }
  }

  realm.sub(setSize$, reAnchor)
  realm.sub(listHeight$, reAnchor)
  realm.sub(viewportHeight$, reAnchor)

  // A scroll that drifts below the offset we last commanded means the user took
  // over (scrolled up) — release the follow so we stop pulling them back down.
  // The commanded offset may briefly exceed what the DOM can realize (the layout
  // estimate runs ahead of a not-yet-painted scrollHeight), so clamp the
  // expectation to the DOM's actual range — only a drift the DOM could have
  // avoided counts as a real user scroll-up.
  realm.sub(scrollTop$, (top) => {
    if (!pendingBottom || settling) {
      return
    }
    const el = realm.getValue(scrollerElement$)
    const domMax = el ? Math.max(0, el.scrollHeight - el.clientHeight) : Number.POSITIVE_INFINITY
    if (top < Math.min(commandedTop, domMax) - SCROLL_TOLERANCE_PX) {
      clearPendingBottom()
    }
  })
}
