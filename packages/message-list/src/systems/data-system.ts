import { Action, Cell, Signal, delayWithMicrotask } from '@virtuoso.dev/gurx'

import { DEFAULT_ITEM_HEIGHT } from '../constants'
import { identityOf } from '../utils/key-manager'
import { scrollToBottom$ } from './autoscroll-system'

import type { AutoscrollToBottom, ItemLocation, ScrollBehavior } from '../dataTypes'

/**
 * Data system: the authoritative item array plus every mutation that flows
 * through it. Imperative `DataMethods` and the controlled `data` prop both
 * publish `DataOp`s onto `dataOp$`; a microtask-delayed flush collapses all ops
 * queued in the same tick into a single data + itemCount update (and one render).
 */

/** What an autoscroll directive resolved to before it reaches the scroll graph. */
export type AutoscrollDirective =
  | { kind: 'none' }
  | { kind: 'bottom'; behavior: ScrollBehavior }
  | { kind: 'location'; location: ItemLocation }

/** A single queued data mutation. */
export interface DataOp {
  /** Produce the next array from the previous one. */
  apply: (prev: unknown[]) => unknown[]
  /** True for operations that grow the start of the list (prepend / insert@0). */
  prepend?: boolean
  /** Purge the measured-size cache alongside this op (replace with `purgeItemSizes`). */
  purgeSizes?: boolean
  /** Autoscroll intent to resolve against the pre-change scroll state. */
  directive?: AutoscrollDirective
  /** Item identity for prepend correlation. */
  identity?: (item: unknown) => unknown
  /** Data the directive callback should receive (added items, or the next array). */
  changeData?: unknown[]
}

/** The rendered item array. Untyped at the realm level; the component narrows. */
export const data$ = Cell<unknown[]>([])
/** Item-identity extractor used for prepend correlation. */
export const itemIdentity$ = Cell<((item: unknown) => unknown) | null>(null)

/** Pending mutations awaiting the next flush. */
export const dataOp$ = Signal<DataOp>()
const opBuffer$ = Cell<DataOp[]>([], (r) => {
  r.changeWith(opBuffer$, dataOp$, (buf, op) => [...buf, op])
})

/** Fires once per microtask after any op is queued. */
const flush$ = Action()

/**
 * Snapshot of the list state at flush time, captured before the data is mutated
 * so prepend anchoring and autoscroll can reason about the pre-change position.
 */
export interface FlushContext {
  prevData: unknown[]
  prevFirstIdentity: unknown
  prevScrollTop: number
  prevDefaultItemSize: number
}

interface FlushPlan {
  next: unknown[]
  purge: boolean
  prepend: { addedCount: number; prevFirstIdentity: unknown } | null
  directive: AutoscrollDirective | null
}

function planOps(buffer: DataOp[], prevData: unknown[]): FlushPlan {
  let next = prevData
  let purge = false
  let prepend: FlushPlan['prepend'] = null
  let directive: AutoscrollDirective | null = null
  let changeData: unknown[] = []

  for (const op of buffer) {
    const before = next
    next = op.apply(before)
    if (op.purgeSizes) purge = true
    if (op.directive && op.directive.kind !== 'none') directive = op.directive
    if (op.changeData) changeData = op.changeData
    if (op.prepend) {
      const identity = op.identity ?? identityOf
      const addedCount = Math.max(0, next.length - before.length)
      const firstPrev = before[0]
      prepend = {
        addedCount,
        prevFirstIdentity: firstPrev === undefined ? undefined : identity(firstPrev),
      }
    }
  }

  return { directive, next, prepend, purge }
}

/** Wire the data graph into a realm. Returns the flush handler for testing. */
export function connectDataSystem(
  realm: import('@virtuoso.dev/gurx').Realm,
  ctx: {
    itemCount$: Cell<number>
    resetSizes$: Action
    scrollTop$: Cell<number>
    defaultItemSize$: Cell<number>
    prependAnchor$: Signal<{ addedCount: number; estimate: number }>
  }
): void {
  realm.register(opBuffer$)
  realm.register(flush$)

  realm.link(realm.pipe(dataOp$, delayWithMicrotask()), flush$)

  realm.sub(flush$, () => {
    const buffer = realm.getValue(opBuffer$)
    if (buffer.length === 0) return

    const prevData = realm.getValue(data$)
    const prevScrollTop = realm.getValue(ctx.scrollTop$)
    const prevDefaultItemSize = realm.getValue(ctx.defaultItemSize$)
    const plan = planOps(buffer, prevData)

    realm.pubIn({
      [data$ as unknown as symbol]: plan.next,
      [ctx.itemCount$ as unknown as symbol]: plan.next.length,
      [opBuffer$ as unknown as symbol]: [],
    })

    if (plan.purge) realm.pub(ctx.resetSizes$)

    if (plan.prepend && plan.prepend.addedCount > 0) {
      realm.pub(ctx.prependAnchor$, {
        addedCount: plan.prepend.addedCount,
        estimate: plan.prepend.addedCount * prevDefaultItemSize,
      })
    }

    if (plan.directive && plan.directive.kind !== 'none') {
      realm.pub(scrollToBottom$, {
        directive: plan.directive,
        changeData,
        prevScrollTop,
      })
    }
  })
}

/** Queue an imperative/controlled data mutation. */
export function pushDataOp(realm: import('@virtuoso.dev/gurx').Realm, op: DataOp): void {
  realm.pub(dataOp$, op)
}

export { DEFAULT_ITEM_HEIGHT }
