import { Realm } from '@virtuoso.dev/gurx'
import { describe, expect, it, vi } from 'vitest'

import { createDataMethods, createListMethods, applyControlledData } from '../src/data-ops'
import { scrollToBottom$ } from '../src/systems/autoscroll-system'
import { connectDataSystem, data$, itemIdentity$ } from '../src/systems/data-system'
import { scrollTop$ } from '../src/systems/dom-system'
import { bottomOffset$, isAtBottom$ } from '../src/systems/is-at-bottom-system'
import { visibleRange$ } from '../src/systems/range-system'
import { listScrollLocation$ } from '../src/systems/scroll-location-system'
import { defaultItemSize$, itemCount$, listHeight$, offsetTree$, resetSizes$, sizeTree$ } from '../src/systems/size-system'
import { connectSmoothScrollSystem, prependAnchor$, scrollToLocation$ } from '../src/systems/smooth-scroll-system'
import { viewportHeight$ } from '../src/systems/viewport-system'
import { insert, newTree } from '../src/utils/a-a-tree'

import type { DataMethods } from '../src/dataTypes'

const tick = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 10)
  })

function makeRealm(initialData: unknown[] = []) {
  // Only `data$` is seeded in the constructor. The layout sources (itemCount$,
  // defaultItemSize$, viewportHeight$, scrollTop$) are published AFTER the derived
  // cells are registered, because gurx dedupes same-value pubs and `combine` only
  // recomputes on a genuine post-registration emission.
  const r = new Realm({ [data$]: initialData })
  r.getValue(visibleRange$)
  r.getValue(offsetTree$)
  r.getValue(listHeight$)
  r.getValue(listScrollLocation$)
  r.getValue(isAtBottom$)
  r.getValue(bottomOffset$)
  r.pub(defaultItemSize$, 56)
  r.pub(itemCount$, initialData.length)
  r.pub(viewportHeight$, 100)
  r.pub(scrollTop$, 0)
  connectDataSystem(r, { itemCount$, resetSizes$, scrollTop$, defaultItemSize$, prependAnchor$ })
  connectSmoothScrollSystem(r)
  return r
}

describe('createDataMethods', () => {
  it('prepend adds to the front and publishes prependAnchor$', async () => {
    const r = makeRealm([1, 2])
    const data = createDataMethods(r)
    const spy = vi.fn()
    r.sub(prependAnchor$, spy)
    data.prepend([0])
    await tick()
    expect(r.getValue(data$)).toEqual([0, 1, 2])
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ addedCount: 1 }))
  })

  it('append adds to the end', async () => {
    const r = makeRealm([1])
    const data = createDataMethods(r)
    data.append([2, 3])
    await tick()
    expect(r.getValue(data$)).toEqual([1, 2, 3])
  })

  it('append with scrollToBottom resolves to a directive', async () => {
    const r = makeRealm([1])
    const data = createDataMethods(r)
    const spy = vi.fn()
    r.sub(scrollToBottom$, spy)
    data.append([2], true)
    await tick()
    // oxlint-disable-next-line typescript-eslint(no-unsafe-assignment) -- expect.objectContaining is untyped in this context
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ directive: expect.objectContaining({ kind: 'bottom' }) }))
  })

  it('map transforms every item', async () => {
    const r = makeRealm([1, 2, 3])
    // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic boundary for test data typing
    const data = createDataMethods(r) as unknown as DataMethods<number, unknown>
    data.map((x) => x * 2)
    await tick()
    expect(r.getValue(data$)).toEqual([2, 4, 6])
  })

  it('findAndDelete removes matching items', async () => {
    const r = makeRealm([1, 2, 3, 4])
    // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic boundary for test data typing
    const data = createDataMethods(r) as unknown as DataMethods<number, unknown>
    data.findAndDelete((x) => x % 2 === 0)
    await tick()
    expect(r.getValue(data$)).toEqual([1, 3])
  })

  it('findIndex / find operate synchronously on current data', () => {
    const r = makeRealm([10, 20, 30])
    const data = createDataMethods(r)
    expect(data.findIndex((x) => x === 20)).toBe(1)
    expect(data.find((x) => x === 30)).toBe(30)
    expect(data.find((x) => x === 999)).toBeUndefined()
  })

  it('insert at an offset splices items and purges sizes', async () => {
    const r = makeRealm([1, 2])
    const spy = vi.fn()
    r.sub(resetSizes$, spy)
    const data = createDataMethods(r)
    data.insert([99], 1)
    await tick()
    expect(r.getValue(data$)).toEqual([1, 99, 2])
    expect(spy).toHaveBeenCalled()
  })

  it('deleteRange removes a slice', async () => {
    const r = makeRealm([1, 2, 3, 4])
    const data = createDataMethods(r)
    data.deleteRange(1, 2)
    await tick()
    expect(r.getValue(data$)).toEqual([1, 4])
  })

  it('replace swaps the whole array and purges sizes', async () => {
    const r = makeRealm([1, 2, 3])
    const spy = vi.fn()
    r.sub(resetSizes$, spy)
    const data = createDataMethods(r)
    data.replace([7, 8])
    await tick()
    expect(r.getValue(data$)).toEqual([7, 8])
    expect(spy).toHaveBeenCalled()
  })

  it('batch coalesces several ops into one flush', async () => {
    const r = makeRealm([1])
    const data = createDataMethods(r)
    data.batch(() => {
      data.append([2])
      data.append([3])
    })
    await tick()
    expect(r.getValue(data$)).toEqual([1, 2, 3])
  })

  it('get returns a copy, not the live array', () => {
    const r = makeRealm([1, 2])
    const data = createDataMethods(r)
    const got = data.get()
    expect(got).toEqual([1, 2])
    got.push(3)
    expect(r.getValue(data$)).toEqual([1, 2])
  })

  it('removeFromStart drops a prefix and purges sizes', async () => {
    const r = makeRealm([1, 2, 3])
    const spy = vi.fn()
    r.sub(resetSizes$, spy)
    const data = createDataMethods(r)
    data.removeFromStart(2)
    await tick()
    expect(r.getValue(data$)).toEqual([3])
    expect(spy).toHaveBeenCalled()
  })

  it('getCurrentlyRendered slices by the visible range', async () => {
    const r = makeRealm([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    // default size 56, viewport 100 => about two items visible at the top.
    await tick()
    const data = createDataMethods(r)
    const range = r.getValue(visibleRange$)
    const rendered = data.getCurrentlyRendered()
    expect(rendered).toEqual(r.getValue(data$).slice(range.start, range.end + 1))
    expect(rendered.length).toBeGreaterThanOrEqual(1)
    expect(rendered.length).toBeLessThanOrEqual(3)
  })
})

describe('createListMethods', () => {
  it('scrollToItem publishes a location request', () => {
    const r = makeRealm()
    const spy = vi.fn()
    r.sub(scrollToLocation$, spy)
    const methods = createListMethods(r, createDataMethods(r))
    methods.scrollToItem({ index: 2, align: 'start' })
    expect(spy).toHaveBeenCalledWith({ location: { index: 2, align: 'start' } })
  })

  it('getScrollLocation returns the snapshot', () => {
    const r = makeRealm([1, 2, 3])
    const methods = createListMethods(r, createDataMethods(r))
    const loc = methods.getScrollLocation()
    expect(loc).toHaveProperty('scrollHeight')
    expect(loc).toHaveProperty('lastVisibleItemIndex')
  })

  it('height resolves measured size via item identity', () => {
    const r = makeRealm(['a', 'b'])
    r.pub(itemIdentity$, (item: unknown) => item)
    r.register(sizeTree$)
    r.pub(sizeTree$, insert(newTree<number>(), 0, 42))
    const methods = createListMethods(r, createDataMethods(r))
    expect(methods.height('a')).toBe(42)
    // unknown item falls back to the default size
    expect(methods.height('zzz')).toBe(56)
  })
})

describe('applyControlledData', () => {
  it('null modifier infers prepend from the arrays', async () => {
    const r = makeRealm([1, 2])
    const spy = vi.fn()
    r.sub(prependAnchor$, spy)
    applyControlledData(r, [1, 2], [0, 1, 2], null)
    await tick()
    expect(r.getValue(data$)).toEqual([0, 1, 2])
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ addedCount: 1 }))
  })

  it("'remove-from-start' purges sizes", async () => {
    const r = makeRealm([1, 2, 3])
    const spy = vi.fn()
    r.sub(resetSizes$, spy)
    applyControlledData(r, [1, 2, 3], [3], 'remove-from-start')
    await tick()
    expect(r.getValue(data$)).toEqual([3])
    expect(spy).toHaveBeenCalled()
  })

  it('item-location modifier drives a location directive', async () => {
    const r = makeRealm([1, 2])
    const spy = vi.fn()
    r.sub(scrollToBottom$, spy)
    applyControlledData(r, [1, 2], [9, 1, 2], { type: 'item-location', location: { align: 'start', index: 0 }, purgeItemSizes: false })
    await tick()
    // oxlint-disable-next-line typescript-eslint(no-unsafe-assignment) -- expect.objectContaining is untyped in this context
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ directive: expect.objectContaining({ kind: 'location' }) }))
  })
})
