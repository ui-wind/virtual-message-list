import { Cell, Signal, delayWithMicrotask } from '@virtuoso.dev/gurx'

import { DEFAULT_ITEM_HEIGHT } from '../constants'
import { identityOf } from '../utils/key-manager'
import { scrollToBottom$ } from './autoscroll-system'

import type { ItemLocation, ScrollBehavior } from '../dataTypes'
import type { NodeRef, Realm } from '@virtuoso.dev/gurx'

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
  prepend?: boolean | undefined
  /** Purge the measured-size cache alongside this op (replace with `purgeItemSizes`). */
  purgeSizes?: boolean | undefined
  /** Autoscroll intent to resolve against the pre-change scroll state. */
  directive?: AutoscrollDirective | undefined
  /** Item identity for prepend correlation. */
  identity?: ((item: unknown) => unknown) | undefined
  /** Data the directive callback should receive (added items, or the next array). */
  changeData?: unknown[] | undefined
}

const defaultIdentity = (item: unknown) => item

/** The rendered item array. Untyped at the realm level; the component narrows. */
export const data$ = Cell<unknown[]>([])
/** Item-identity extractor used for prepend correlation. */
export const itemIdentity$ = Cell<((item: unknown) => unknown) | null>(null)

/** Pending mutations awaiting the next flush. */
export const dataOp$ = Signal<DataOp>()
const opBuffer$ = Cell<DataOp[]>([], (r) => {
  r.changeWith(opBuffer$, dataOp$, (buf, op) => [...buf, op])
})

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
  changeData: unknown[]
}

/** Nodes the data system reads/publishes but does not own; passed in by the component. */
export interface DataSystemContext {
  itemCount$: NodeRef<number>
  resetSizes$: NodeRef<void>
  scrollTop$: NodeRef<number>
  defaultItemSize$: NodeRef<number>
  prependAnchor$: NodeRef<{ addedCount: number; estimate: number }>
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
    if (op.purgeSizes === true) {
      purge = true
    }
    if (op.directive && op.directive.kind !== 'none') {
      directive = op.directive
    }
    if (op.changeData) {
      changeData = op.changeData
    }
    if (op.prepend === true) {
      const identity = op.identity ?? defaultIdentity
      const addedCount = Math.max(0, next.length - before.length)
      const firstPrev = before[0]
      prepend = {
        addedCount,
        prevFirstIdentity: firstPrev === undefined ? undefined : identity(firstPrev),
      }
    }
  }

  return { changeData, directive, next, prepend, purge }
}

/** Wire the data graph into a realm. */
export function connectDataSystem(realm: Realm, ctx: DataSystemContext): void {
  realm.register(opBuffer$)

  const flush$ = realm.pipe(dataOp$, delayWithMicrotask())

  realm.sub(flush$, () => {
    const buffer = realm.getValue(opBuffer$)
    if (buffer.length === 0) {
      return
    }

    const prevData = realm.getValue(data$)
    const prevScrollTop = realm.getValue(ctx.scrollTop$)
    const prevDefaultItemSize = realm.getValue(ctx.defaultItemSize$)
    const plan = planOps(buffer, prevData)

    realm.pubIn({
      [data$]: plan.next,
      [ctx.itemCount$]: plan.next.length,
      [opBuffer$]: [],
    })

    if (plan.purge) {
      realm.pub(ctx.resetSizes$)
    }

    if (plan.prepend && plan.prepend.addedCount > 0) {
      realm.pub(ctx.prependAnchor$, {
        addedCount: plan.prepend.addedCount,
        estimate: plan.prepend.addedCount * prevDefaultItemSize,
      })
    }

    if (plan.directive && plan.directive.kind !== 'none') {
      realm.pub(scrollToBottom$, {
        directive: plan.directive,
        changeData: plan.changeData,
        prevScrollTop,
      })
    }
  })
}

/** Queue an imperative/controlled data mutation. */
export function pushDataOp(realm: Realm, op: DataOp): void {
  realm.pub(dataOp$, op)
}

/** Compute the identity of an item using the active identity extractor. */
export function itemKey(realm: Realm, item: unknown): unknown {
  return identityOf(item, realm.getValue(itemIdentity$) ?? undefined)
}

export { DEFAULT_ITEM_HEIGHT }
