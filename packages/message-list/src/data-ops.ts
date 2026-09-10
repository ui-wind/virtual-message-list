import { resolveAutoscroll, autoscrollParams } from './systems/autoscroll-system'
import { data$, itemIdentity$, itemKey, pushDataOp } from './systems/data-system'
import { scrollTop$, scrollerElement$ } from './systems/dom-system'
import { visibleRange$ } from './systems/range-system'
import { listScrollLocation$ } from './systems/scroll-location-system'
import { defaultItemSize$, offsetOfIndex, offsetTree$, sizeAtIndex, sizeTree$ } from './systems/size-system'
import { cancelSmoothScroll$, scrollToLocation$ } from './systems/smooth-scroll-system'
import { isPrependExtension } from './utils/key-manager'

import type { AutoscrollToBottom, DataMethods, ItemLocation, ScrollBehavior, ScrollModifier, VirtuosoMessageListMethods } from './dataTypes'
import type { DataOp, AutoscrollDirective } from './systems/data-system'
import type { Realm } from '@virtuoso.dev/gurx'

/** A `{ location }`-shaped items-change behavior selector. */
type ChangeBehavior = ScrollBehavior | { location: () => ItemLocation | null | undefined }

function currentIdentity(realm: Realm): ((item: unknown) => unknown) | undefined {
  return realm.getValue(itemIdentity$) ?? undefined
}

/**
 * Resolve the public `autoscrollToBottom` value (append / insert / batch /
 * notifyItemsChanged) into a directive against the pre-change scroll state.
 */
function resolveDirective(realm: Realm, value: AutoscrollToBottom | undefined, changeData: unknown[]): AutoscrollDirective {
  if (value === undefined) {
    return { kind: 'none' }
  }
  return resolveAutoscroll(value, autoscrollParams(realm, changeData))
}

/**
 * Resolve the `items-change` behavior (map / mapWithAnchor): a `{ location }`
 * selector targets an explicit item, while a `ScrollBehavior` scrolls to the
 * bottom only when already at the bottom.
 */
function resolveChangeBehavior(realm: Realm, behavior: ChangeBehavior | undefined, changeData: unknown[]): AutoscrollDirective {
  if (behavior === undefined) {
    return { kind: 'none' }
  }
  if (typeof behavior === 'object' && behavior !== null && 'location' in behavior) {
    const location = behavior.location()
    return location === null || location === undefined ? { kind: 'none' } : { kind: 'location', location }
  }
  const params = autoscrollParams(realm, changeData)
  return params.atBottom ? { kind: 'bottom', behavior } : { kind: 'none' }
}

/** Translate a controlled-data `scrollModifier` into op fragments. */
function resolveScrollModifier(
  realm: Realm,
  modifier: ScrollModifier,
  prevData: unknown[],
  nextData: unknown[]
): Pick<DataOp, 'directive' | 'purgeSizes' | 'prepend'> {
  if (modifier === null || modifier === undefined) {
    return {}
  }
  if (modifier === 'prepend') {
    return { prepend: true }
  }
  if (modifier === 'remove-from-start') {
    return { purgeSizes: true }
  }
  if (modifier === 'remove-from-end') {
    return {}
  }
  if (typeof modifier === 'object') {
    if (modifier.type === 'item-location') {
      return { directive: { kind: 'location', location: modifier.location }, purgeSizes: modifier.purgeItemSizes }
    }
    if (modifier.type === 'auto-scroll-to-bottom') {
      return { directive: resolveDirective(realm, modifier.autoScroll, nextData) }
    }
    if (modifier.type === 'items-change') {
      return { directive: resolveChangeBehavior(realm, modifier.behavior, nextData) }
    }
  }
  return { prepend: isPrependExtension(prevData, nextData, currentIdentity(realm)) }
}

/** Build the imperative `DataMethods` bound to a realm. */
export function createDataMethods(realm: Realm): DataMethods<unknown, unknown> {
  return {
    prepend(data) {
      pushDataOp(realm, { apply: (prev) => [...data, ...prev], prepend: true, purgeSizes: true, identity: currentIdentity(realm) })
    },
    append(data, scrollToBottom) {
      pushDataOp(realm, {
        apply: (prev) => [...prev, ...data],
        directive: resolveDirective(realm, scrollToBottom, data),
        changeData: data,
      })
    },
    map(callbackfn, autoscrollToBottomBehavior) {
      const changeData = realm.getValue(data$).map(callbackfn)
      pushDataOp(realm, {
        apply: (prev) => prev.map(callbackfn),
        directive: resolveChangeBehavior(realm, autoscrollToBottomBehavior, changeData),
        changeData,
      })
    },
    mapWithAnchor(callbackfn, anchorItemIndex) {
      const scrollTop = realm.getValue(scrollTop$)
      const anchorOffset = offsetOfIndex(realm.getValue(offsetTree$), anchorItemIndex)
      const relativeTop = anchorOffset - scrollTop
      pushDataOp(realm, {
        apply: (prev) => prev.map(callbackfn),
        directive: { kind: 'location', location: { align: 'start', behavior: 'auto', index: anchorItemIndex, offset: -relativeTop } },
      })
    },
    findAndDelete(predicate) {
      pushDataOp(realm, { apply: (prev) => prev.filter((item, index) => !predicate(item, index)), purgeSizes: true })
    },
    findIndex(predicate) {
      return realm.getValue(data$).findIndex(predicate)
    },
    find(predicate) {
      return realm.getValue(data$).find(predicate)
    },
    replace(data, options) {
      const location = options?.initialLocation
      pushDataOp(realm, {
        apply: () => data,
        purgeSizes: options?.purgeItemSizes !== false,
        directive: location === undefined ? { kind: 'none' } : { kind: 'location', location },
      })
    },
    insert(data, offset, scrollToBottom) {
      pushDataOp(realm, {
        apply: (prev) => {
          const next = prev.slice()
          next.splice(offset, 0, ...data)
          return next
        },
        prepend: offset <= 0,
        purgeSizes: true,
        identity: currentIdentity(realm),
        directive: resolveDirective(realm, scrollToBottom, data),
        changeData: data,
      })
    },
    deleteRange(offset, count) {
      pushDataOp(realm, {
        apply: (prev) => {
          const next = prev.slice()
          next.splice(offset, count)
          return next
        },
        purgeSizes: true,
      })
    },
    batch(callback, scrollToBottom) {
      callback()
      if (scrollToBottom !== undefined) {
        const changeData = realm.getValue(data$)
        pushDataOp(realm, { apply: (prev) => prev, directive: resolveDirective(realm, scrollToBottom, changeData), changeData })
      }
    },
    get() {
      return [...realm.getValue(data$)]
    },
    getCurrentlyRendered() {
      const range = realm.getValue(visibleRange$)
      const all = realm.getValue(data$)
      return all.slice(range.start, range.end + 1)
    },
    removeFromStart(count) {
      pushDataOp(realm, { apply: (prev) => prev.slice(count), purgeSizes: true })
    },
  }
}

/** Build the imperative scroll/list methods bound to a realm. */
export function createListMethods(realm: Realm, data: DataMethods<unknown, unknown>): VirtuosoMessageListMethods<unknown, unknown> {
  return {
    data,
    scrollToItem(location) {
      realm.pub(scrollToLocation$, { location })
    },
    scrollIntoView(location) {
      realm.pub(scrollToLocation$, { location })
    },
    scrollerElement() {
      return realm.getValue(scrollerElement$)
    },
    getScrollLocation() {
      return realm.getValue(listScrollLocation$)
    },
    cancelSmoothScroll() {
      realm.pub(cancelSmoothScroll$)
    },
    notifyItemsChanged(options) {
      const changeData = realm.getValue(data$)
      pushDataOp(realm, {
        apply: (prev) => prev,
        directive: resolveDirective(realm, options.scrollToBottom, changeData),
        changeData,
      })
    },
    height(item) {
      const key = itemKey(realm, item)
      const index = realm.getValue(data$).findIndex((it) => itemKey(realm, it) === key)
      if (index === -1) {
        return realm.getValue(defaultItemSize$)
      }
      return sizeAtIndex(realm.getValue(sizeTree$), index, realm.getValue(defaultItemSize$))
    },
  }
}

/**
 * Apply a controlled `data` prop change through the op pipeline so prepend
 * anchoring and the `scrollModifier` run exactly as they do for imperative ops.
 */
export function applyControlledData(realm: Realm, prevData: unknown[], nextData: unknown[], modifier: ScrollModifier): void {
  const fragments = resolveScrollModifier(realm, modifier, prevData, nextData)
  const prepend = fragments.prepend ?? isPrependExtension(prevData, nextData, currentIdentity(realm))
  pushDataOp(realm, {
    apply: () => nextData,
    prepend,
    purgeSizes: prepend ? true : fragments.purgeSizes,
    identity: currentIdentity(realm),
    directive: fragments.directive,
    changeData: nextData,
  })
}
