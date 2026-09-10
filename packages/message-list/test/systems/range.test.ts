import { Realm } from '@virtuoso.dev/gurx'
import { describe, expect, it } from 'vitest'

import { scrollTop$ } from '../../src/systems/dom-system'
import { visibleRange$ } from '../../src/systems/range-system'
import { defaultItemSize$, itemCount$ } from '../../src/systems/size-system'
import { increaseViewportBy$, viewportHeight$ } from '../../src/systems/viewport-system'

describe('visibleRange', () => {
  function makeRealm(count: number, opts: { viewport?: number; scrollTop?: number; overscan?: number } = {}) {
    const r = new Realm()
    r.getValue(visibleRange$)
    r.pub(defaultItemSize$, 50)
    r.pub(itemCount$, count)
    r.pub(viewportHeight$, opts.viewport ?? 100)
    r.pub(scrollTop$, opts.scrollTop ?? 0)
    r.pub(increaseViewportBy$, opts.overscan ?? 0)
    return r
  }

  it('empty list returns start 0 end 0', async () => {
    const r = makeRealm(0)
    await Promise.resolve()
    expect(r.getValue(visibleRange$)).toEqual({ start: 0, end: 0 })
  })

  it('top of list shows first items', async () => {
    const r = makeRealm(10, { viewport: 100, scrollTop: 0 })
    await Promise.resolve()
    const range = r.getValue(visibleRange$)
    expect(range.start).toBe(0)
    // viewport 100 / item 50 = 2 items visible, end inclusive
    expect(range.end).toBeGreaterThanOrEqual(1)
  })

  it('scrolled down shifts start', async () => {
    const r = makeRealm(20, { viewport: 100, scrollTop: 200 })
    await Promise.resolve()
    const range = r.getValue(visibleRange$)
    expect(range.start).toBeGreaterThan(0)
  })

  it('clamps end to count - 1', async () => {
    const r = makeRealm(3, { viewport: 1000, scrollTop: 0 })
    await Promise.resolve()
    const range = r.getValue(visibleRange$)
    expect(range.end).toBe(2)
    expect(range.start).toBe(0)
  })

  it('overscan expands range', async () => {
    const rNoOverscan = makeRealm(20, { viewport: 100, scrollTop: 200, overscan: 0 })
    const rOverscan = makeRealm(20, { viewport: 100, scrollTop: 200, overscan: 100 })
    await Promise.resolve()
    const a = rNoOverscan.getValue(visibleRange$)
    const b = rOverscan.getValue(visibleRange$)
    expect(b.start).toBeLessThanOrEqual(a.start)
    expect(b.end).toBeGreaterThanOrEqual(a.end)
  })
})
