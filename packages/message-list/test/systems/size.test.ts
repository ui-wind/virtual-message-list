import { Realm } from '@virtuoso.dev/gurx'
import { describe, expect, it } from 'vitest'

import { DEFAULT_ITEM_HEIGHT } from '../../src/constants'
import {
  defaultItemSize$,
  itemCount$,
  listHeight$,
  offsetOfIndex,
  offsetTree$,
  sizeAtIndex,
  sizeTree$,
} from '../../src/systems/size-system'

describe('size-system queries', () => {
  it('sizeAtIndex returns measured size when present', async () => {
    const { insert, newTree } = await import('../../src/utils/a-a-tree')
    const tree = insert(newTree<number>(), 2, 99)
    expect(sizeAtIndex(tree, 2, 56)).toBe(99)
  })

  it('sizeAtIndex falls back to default', async () => {
    const { newTree } = await import('../../src/utils/a-a-tree')
    expect(sizeAtIndex(newTree<number>(), 5, 56)).toBe(56)
  })

  it('offsetOfIndex returns stored offset', async () => {
    const { insert, newTree } = await import('../../src/utils/a-a-tree')
    const tree = insert(insert(newTree<number>(), 0, 0), 1, 56)
    expect(offsetOfIndex(tree, 1)).toBe(56)
    expect(offsetOfIndex(tree, 99)).toBe(0)
  })
})

describe('size-system realm integration', () => {
  // gurx `combine`-derived cells only recompute when a source emits AFTER the
  // derived node is registered. Touching the output first wires the layout chain
  // so subsequent input pubs propagate synchronously.
  it('listHeight equals count * defaultSize when no measurements', () => {
    const r = new Realm()
    r.getValue(listHeight$)
    r.pub(itemCount$, 3)
    r.pub(defaultItemSize$, 50)
    expect(r.getValue(listHeight$)).toBe(150)
  })

  it('offsetTree contains offsets per index', () => {
    const r = new Realm()
    r.getValue(offsetTree$)
    r.getValue(listHeight$)
    r.pub(defaultItemSize$, 10)
    r.pub(itemCount$, 3)
    const tree = r.getValue(offsetTree$)
    expect(offsetOfIndex(tree, 0)).toBe(0)
    expect(offsetOfIndex(tree, 1)).toBe(10)
    expect(offsetOfIndex(tree, 2)).toBe(20)
    expect(r.getValue(listHeight$)).toBe(30)
  })

  it('defaultItemSize defaults to DEFAULT_ITEM_HEIGHT', () => {
    const r = new Realm()
    expect(r.getValue(defaultItemSize$)).toBe(DEFAULT_ITEM_HEIGHT)
  })

  it('sizeTree starts empty', async () => {
    const { empty } = await import('../../src/utils/a-a-tree')
    const r = new Realm()
    expect(empty(r.getValue(sizeTree$))).toBe(true)
  })
})
