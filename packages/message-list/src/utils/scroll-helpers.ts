import type { ItemLocation, ItemLocationCallbackParams, ItemLocationWithAlign, ScrollBehavior } from '../dataTypes'

export function scrollToBottomIfAtBottom({ atBottom, scrollInProgress }: ItemLocationCallbackParams): ScrollBehavior | false {
  return atBottom || scrollInProgress ? 'smooth' : false
}

export function scrollToBottomAlways(): ItemLocation {
  return { index: 'LAST', align: 'end', behavior: 'smooth' }
}

export function resolveIndex(index: number | 'LAST', length: number): number {
  return index === 'LAST' ? Math.max(0, length - 1) : index
}

export function normalizeLocation(location: ItemLocation): ItemLocationWithAlign {
  if (typeof location === 'number') {
    return { index: location, align: 'start', behavior: 'auto' }
  }
  return location
}
