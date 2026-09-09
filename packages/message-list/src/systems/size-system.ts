import { Action, Cell, map, Signal } from '@virtuoso.dev/gurx'

import { DEFAULT_ITEM_HEIGHT } from '../constants'
import { type AANode, find, insert, newTree } from '../utils/a-a-tree'

/**
 * Size system: the measured size of each item, keyed by index in an AA-tree,
 * plus the derived absolute-offset layout (offset tree keyed by index and the
 * total list height). Every offset/range query in the list resolves through
 * the nodes exported here.
 */

/** A layout snapshot: per-index offsets and the total content height. */
export interface ListLayout {
  /** index -> absolute top offset within the scrollable content. */
  tree: AANode<number>
  /** total height of all items (offset just past the last item). */
  height: number
}

/** Record the measured size of one item. */
export const setSize$ = Signal<{ index: number; size: number }>()
/** Drop all measured sizes (e.g. a data replace with `purgeItemSizes`). */
export const resetSizes$ = Action()
/** Number of items currently in the list. */
export const itemCount$ = Cell<number>(0)
/** Fallback size for items that have not been measured yet. */
export const defaultItemSize$ = Cell<number>(DEFAULT_ITEM_HEIGHT)

/** Measured size per item index. */
export const sizeTree$ = Cell<AANode<number>>(newTree<number>(), (r) => {
  r.changeWith(sizeTree$, setSize$, (tree, { index, size }) => insert(tree, index, size))
  r.changeWith(sizeTree$, resetSizes$, () => newTree<number>())
})

const emptyLayout: ListLayout = { height: 0, tree: newTree<number>() }

/** Derived layout, recomputed when sizes, count, or default size change. */
const layout$ = Cell<ListLayout>(emptyLayout, (r) => {
  r.changeWith(layout$, r.combine(sizeTree$, itemCount$, defaultItemSize$), (_current, [sizes, count, defaultSize]) =>
    buildLayout(sizes, count, defaultSize)
  )
})

/** index -> absolute top offset. */
export const offsetTree$ = Cell<AANode<number>>(newTree<number>(), (r) => {
  r.link(
    r.pipe(
      layout$,
      map((layout) => layout.tree)
    ),
    offsetTree$
  )
})

/** Total scrollable content height. */
export const listHeight$ = Cell<number>(0, (r) => {
  r.link(
    r.pipe(
      layout$,
      map((layout) => layout.height)
    ),
    listHeight$
  )
})

// -- pure queries over a layout snapshot

function buildLayout(sizes: AANode<number>, count: number, defaultSize: number): ListLayout {
  let tree: AANode<number> = newTree<number>()
  let offset = 0
  for (let index = 0; index < count; index++) {
    tree = insert(tree, index, offset)
    offset += find(sizes, index) ?? defaultSize
  }
  return { height: offset, tree }
}

/** Measured-or-default size of a single item index. */
export function sizeAtIndex(sizes: AANode<number>, index: number, defaultSize: number): number {
  return find(sizes, index) ?? defaultSize
}

/** Absolute top offset of an item index; `0` when not present. */
export function offsetOfIndex(offsets: AANode<number>, index: number): number {
  return find(offsets, index) ?? 0
}
