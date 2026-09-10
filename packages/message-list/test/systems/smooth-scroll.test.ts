import { Realm } from '@virtuoso.dev/gurx'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { scrollTo$, scrollTop$ } from '../../src/systems/dom-system'
import { scrollInProgress$, scrollToBottomInProgress$ } from '../../src/systems/is-at-bottom-system'
import { defaultItemSize$, itemCount$, listHeight$, offsetTree$ } from '../../src/systems/size-system'
import { connectSmoothScrollSystem, scrollToLocation$, cancelSmoothScroll$, prependAnchor$ } from '../../src/systems/smooth-scroll-system'
import { viewportHeight$ } from '../../src/systems/viewport-system'

// gurx combine-derived cells only recompute when a source emits AFTER the derived
// node is registered. computeTargetTop reads offsetTree$/listHeight$ via getValue,
// so the layout chain must be wired before itemCount$/defaultItemSize$ are published.
function makeRealm() {
  const r = new Realm()
  r.getValue(offsetTree$)
  r.getValue(listHeight$)
  r.pub(defaultItemSize$, 50)
  r.pub(itemCount$, 10) // height 500
  r.pub(viewportHeight$, 100)
  r.pub(scrollTop$, 0)
  connectSmoothScrollSystem(r)
  return r
}

describe('smooth-scroll: auto behavior lands immediately', () => {
  it('numeric location jumps and publishes scrollTo$', () => {
    const r = makeRealm()
    const spy = vi.fn()
    r.sub(scrollTo$, spy)
    r.pub(scrollToLocation$, { location: 3 }) // align start, offset 3*50 = 150
    expect(spy).toHaveBeenCalledWith({ behavior: 'auto', top: 150 })
    expect(r.getValue(scrollTop$)).toBe(150)
  })

  it('clamps target to max scroll', () => {
    const r = makeRealm()
    const spy = vi.fn()
    r.sub(scrollTo$, spy)
    // last item index 9 offset 450, maxScroll = 500-100 = 400
    r.pub(scrollToLocation$, { location: 9 })
    expect(spy).toHaveBeenCalledWith({ behavior: 'auto', top: 400 })
  })

  it('empty list jumps to 0', () => {
    const r = new Realm()
    r.getValue(offsetTree$)
    r.getValue(listHeight$)
    r.pub(itemCount$, 0)
    r.pub(defaultItemSize$, 50)
    r.pub(viewportHeight$, 100)
    connectSmoothScrollSystem(r)
    const spy = vi.fn()
    r.sub(scrollTo$, spy)
    r.pub(scrollToLocation$, { location: 5 })
    expect(spy).toHaveBeenCalledWith({ behavior: 'auto', top: 0 })
  })

  it('done callback fires on auto jump', () => {
    const r = makeRealm()
    const done = vi.fn()
    r.pub(scrollToLocation$, { location: { index: 2, align: 'start', behavior: 'auto', done } })
    expect(done).toHaveBeenCalled()
  })

  it('prependAnchor shifts scrollTop by estimate', () => {
    const r = makeRealm()
    const spy = vi.fn()
    r.sub(scrollTo$, spy)
    r.pub(scrollTop$, 100)
    r.pub(prependAnchor$, { addedCount: 2, estimate: 100 })
    expect(r.getValue(scrollTop$)).toBe(200)
    expect(spy).toHaveBeenCalledWith({ behavior: 'auto', top: 200 })
  })

  it('prependAnchor with estimate 0 is a no-op', () => {
    const r = makeRealm()
    const spy = vi.fn()
    r.sub(scrollTo$, spy)
    r.pub(scrollTop$, 100)
    r.pub(prependAnchor$, { addedCount: 0, estimate: 0 })
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('smooth-scroll: smooth behavior animates via rAF', () => {
  let rafQueue: FrameRequestCallback[] = []
  let originalRaf: typeof globalThis.requestAnimationFrame
  let originalCancel: typeof globalThis.cancelAnimationFrame

  beforeEach(() => {
    rafQueue = []
    originalRaf = globalThis.requestAnimationFrame
    originalCancel = globalThis.cancelAnimationFrame
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      rafQueue.push(cb)
      return rafQueue.length
    }
    globalThis.cancelAnimationFrame = () => {}
  })

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf
    globalThis.cancelAnimationFrame = originalCancel
  })

  function pumpFrames(n: number) {
    for (let i = 0; i < n; i++) {
      const cb = rafQueue.shift()
      if (cb) {
        cb(i)
      }
    }
  }

  it('sets scrollInProgress true during animation', () => {
    const r = makeRealm()
    r.pub(scrollToLocation$, { location: { index: 4, align: 'start', behavior: 'smooth' } })
    expect(r.getValue(scrollInProgress$)).toBe(true)
  })

  it('finishes animation and clears scrollInProgress', () => {
    const r = makeRealm()
    const done = vi.fn()
    r.pub(scrollToLocation$, { location: { index: 4, align: 'start', behavior: 'smooth', done } })
    // drive frames until done (SMOOTH_SCROLL_DEFAULT_FRAMES = 30)
    pumpFrames(40)
    expect(r.getValue(scrollInProgress$)).toBe(false)
    expect(done).toHaveBeenCalled()
    expect(r.getValue(scrollTop$)).toBe(200)
  })

  it('isBottom sets scrollToBottomInProgress', () => {
    const r = makeRealm()
    r.pub(scrollToLocation$, { location: { index: 'LAST', align: 'end', behavior: 'smooth' }, isBottom: true })
    expect(r.getValue(scrollToBottomInProgress$)).toBe(true)
  })

  it('cancelSmoothScroll clears flags', () => {
    const r = makeRealm()
    r.pub(scrollToLocation$, { location: { index: 4, align: 'start', behavior: 'smooth' } })
    expect(r.getValue(scrollInProgress$)).toBe(true)
    r.pub(cancelSmoothScroll$)
    expect(r.getValue(scrollInProgress$)).toBe(false)
  })

  it('smooth to same position jumps immediately (distance 0)', () => {
    const r = makeRealm()
    // index 0 align start target 0, already at 0
    r.pub(scrollToLocation$, { location: { index: 0, align: 'start', behavior: 'smooth' } })
    expect(r.getValue(scrollInProgress$)).toBe(false)
    expect(rafQueue.length).toBe(0)
  })
})
