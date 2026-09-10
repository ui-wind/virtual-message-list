import { Realm } from '@virtuoso.dev/gurx'
import { describe, expect, it, vi } from 'vitest'

import { scrollToBottom$ } from '../../src/systems/autoscroll-system'
import { connectDataSystem, data$, pushDataOp } from '../../src/systems/data-system'
import { scrollTop$ } from '../../src/systems/dom-system'
import { defaultItemSize$, itemCount$, resetSizes$ } from '../../src/systems/size-system'
import { prependAnchor$ } from '../../src/systems/smooth-scroll-system'

const tick = (ms = 10) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

function makeRealm() {
  const r = new Realm({ [data$]: [] as unknown[], [itemCount$]: 0 })
  connectDataSystem(r, { itemCount$, resetSizes$, scrollTop$, defaultItemSize$, prependAnchor$ })
  return r
}

describe('data system', () => {
  it('flushes a single op via microtask', async () => {
    const r = makeRealm()
    pushDataOp(r, { apply: (prev) => [...prev, 1, 2] })
    // not flushed yet synchronously
    expect(r.getValue(data$)).toEqual([])
    await Promise.resolve()
    // microtask flush: still need the delayWithMicrotask tick
    await tick(0)
    await Promise.resolve()
    // give extra tick for gurx internal scheduling
    await tick(0)
    expect(r.getValue(data$)).toEqual([1, 2])
    expect(r.getValue(itemCount$)).toBe(2)
  })

  it('batches multiple ops in the same tick', async () => {
    const r = makeRealm()
    pushDataOp(r, { apply: (prev) => [...prev, 1] })
    pushDataOp(r, { apply: (prev) => [...prev, 2] })
    await tick()
    expect(r.getValue(data$)).toEqual([1, 2])
  })

  it('purgeSizes triggers resetSizes$', async () => {
    const r = makeRealm()
    const spy = vi.fn()
    r.sub(resetSizes$, spy)
    pushDataOp(r, { apply: (prev) => [...prev, 1], purgeSizes: true })
    await tick()
    expect(spy).toHaveBeenCalled()
  })

  it('prepend publishes prependAnchor$', async () => {
    const r = makeRealm()
    // seed with one item
    pushDataOp(r, { apply: () => [1] })
    await tick()
    const spy = vi.fn()
    r.sub(prependAnchor$, spy)
    pushDataOp(r, { apply: (prev) => [0, ...prev], prepend: true })
    await tick()
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ addedCount: 1 }))
  })

  it('directive publishes scrollToBottom$', async () => {
    const r = makeRealm()
    const spy = vi.fn()
    r.sub(scrollToBottom$, spy)
    pushDataOp(r, {
      apply: (prev) => [...prev, 1],
      directive: { kind: 'bottom', behavior: 'smooth' },
      changeData: [1],
    })
    await tick()
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ directive: { kind: 'bottom', behavior: 'smooth' } }))
  })
})
