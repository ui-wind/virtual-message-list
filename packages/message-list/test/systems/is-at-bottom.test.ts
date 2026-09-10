import { Realm } from '@virtuoso.dev/gurx'
import { describe, expect, it } from 'vitest'

import { scrollTop$ } from '../../src/systems/dom-system'
import { bottomOffset$, isAtBottom$, scrollInProgress$, scrollToBottomInProgress$ } from '../../src/systems/is-at-bottom-system'
import { listHeight$ } from '../../src/systems/size-system'
import { viewportHeight$ } from '../../src/systems/viewport-system'

describe('is-at-bottom', () => {
  function makeRealm() {
    const r = new Realm()
    // gurx combine-derived cells only recompute when a source emits AFTER the
    // derived node is registered. Touch the outputs first so the subsequent input
    // pubs propagate synchronously.
    r.getValue(bottomOffset$)
    r.getValue(isAtBottom$)
    return r
  }

  it('bottomOffset = listHeight - viewport - scrollTop', async () => {
    const r = makeRealm()
    r.pub(listHeight$, 1000)
    r.pub(viewportHeight$, 400)
    r.pub(scrollTop$, 200)
    // flush microtask
    await Promise.resolve()
    expect(r.getValue(bottomOffset$)).toBe(400)
  })

  it('bottomOffset is 0 when scrolled to bottom', async () => {
    const r = makeRealm()
    r.pub(listHeight$, 1000)
    r.pub(viewportHeight$, 400)
    r.pub(scrollTop$, 600)
    await Promise.resolve()
    expect(r.getValue(bottomOffset$)).toBe(0)
  })

  it('isAtBottom true when bottomOffset <= threshold', async () => {
    const r = makeRealm()
    r.pub(listHeight$, 1000)
    r.pub(viewportHeight$, 400)
    r.pub(scrollTop$, 600) // bottomOffset = 0
    await Promise.resolve()
    expect(r.getValue(isAtBottom$)).toBe(true)
  })

  it('isAtBottom false when far from bottom', async () => {
    const r = makeRealm()
    r.pub(listHeight$, 1000)
    r.pub(viewportHeight$, 400)
    r.pub(scrollTop$, 0) // bottomOffset = 600
    await Promise.resolve()
    expect(r.getValue(isAtBottom$)).toBe(false)
  })

  it('isAtBottom true when scrollToBottomInProgress even if not at position', async () => {
    const r = makeRealm()
    r.pub(listHeight$, 1000)
    r.pub(viewportHeight$, 400)
    r.pub(scrollTop$, 0)
    await Promise.resolve()
    expect(r.getValue(isAtBottom$)).toBe(false)
    r.pub(scrollToBottomInProgress$, true)
    await Promise.resolve()
    expect(r.getValue(isAtBottom$)).toBe(true)
  })

  it('scrollInProgress defaults to false', () => {
    const r = makeRealm()
    expect(r.getValue(scrollInProgress$)).toBe(false)
  })
})
