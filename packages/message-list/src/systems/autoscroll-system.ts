import { Signal } from '@virtuoso.dev/gurx'

import { context$ } from './config-system'
import { isAtBottom$, scrollInProgress$ } from './is-at-bottom-system'
import { listScrollLocation$ } from './scroll-location-system'
import { scrollToLocation$ } from './smooth-scroll-system'

import type { AutoscrollToBottom, ItemLocation, ItemLocationCallback, ItemLocationCallbackParams, ScrollBehavior } from '../dataTypes'
import type { AutoscrollDirective } from './data-system'
import type { Realm } from '@virtuoso.dev/gurx'

/**
 * Autoscroll system: turns an already-resolved `AutoscrollDirective` (attached
 * to a queued data op by the imperative handle / controlled-data path) into a
 * concrete scroll-to-location request. Pure policy resolution lives in
 * `resolveAutoscroll`, so callers can reason about the pre-change scroll state
 * at the moment the mutation is queued.
 */

/** Any value the public `autoscrollToBottom` contract accepts, or a callback's result. */
type AutoscrollInput = AutoscrollToBottom | ItemLocation | ScrollBehavior | undefined

/** Payload the data system publishes when a flushed op carries autoscroll intent. */
export interface ScrollToBottomInput {
  directive: AutoscrollDirective
  changeData: unknown[]
  prevScrollTop: number
}

/** Channel from the data flush into the autoscroll resolver. */
export const scrollToBottom$ = Signal<ScrollToBottomInput>()

/**
 * Resolve the public `autoscrollToBottom` value against the current scroll state
 * into an `AutoscrollDirective`. Mirrors the documented contract:
 * - `false` / `undefined` preserves the viewport.
 * - `true` scrolls to the bottom (`'auto'`) only when already at the bottom.
 * - a `ScrollBehavior` scrolls to the bottom only when already at the bottom.
 * - a callback may return `false`, a `ScrollBehavior`, or an `ItemLocation`.
 */
export function resolveAutoscroll(value: AutoscrollInput, params: ItemLocationCallbackParams): AutoscrollDirective {
  if (value === false || value === undefined) {
    return { kind: 'none' }
  }

  if (typeof value === 'function') {
    // A function value is always the callback form here; the easing-function
    // branch of `ScrollBehavior` is consumed by the smooth-scroll system, not us.
    // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- union of two call signatures, callback is the only reachable one
    const callback = value as ItemLocationCallback
    const result = callback(params)
    return resolveAutoscroll(result, params)
  }

  if (typeof value === 'number' || (typeof value === 'object' && value !== null && 'index' in value)) {
    return { kind: 'location', location: value as ItemLocation }
  }

  if (value === true || typeof value === 'string') {
    if (!params.atBottom) {
      return { kind: 'none' }
    }
    const behavior = value === true ? 'auto' : (value as ScrollBehavior)
    return { kind: 'bottom', behavior }
  }

  return { kind: 'none' }
}

/** Build the callback params snapshot from current realm state. */
export function autoscrollParams(realm: Realm, data: unknown[]): ItemLocationCallbackParams {
  return {
    atBottom: realm.getValue(isAtBottom$),
    context: realm.getValue(context$),
    data,
    scrollInProgress: realm.getValue(scrollInProgress$),
    scrollLocation: realm.getValue(listScrollLocation$),
  }
}

/** Wire the autoscroll graph: resolve directives into scroll requests. */
export function connectAutoscrollSystem(realm: Realm): void {
  realm.sub(scrollToBottom$, ({ directive }) => {
    if (directive.kind === 'none') {
      return
    }
    if (directive.kind === 'bottom') {
      realm.pub(scrollToLocation$, {
        behavior: directive.behavior,
        isBottom: true,
        location: { align: 'end', index: 'LAST' },
      })
      return
    }
    // directive.kind === 'location'
    realm.pub(scrollToLocation$, {
      isBottom: false,
      location: directive.location,
    })
  })
}
