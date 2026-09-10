import { Realm } from '@virtuoso.dev/gurx'
import { describe, expect, it, vi } from 'vitest'

import { autoscrollParams, connectAutoscrollSystem, resolveAutoscroll, scrollToBottom$ } from '../../src/systems/autoscroll-system'
import { context$ } from '../../src/systems/config-system'
import { scrollToLocation$ } from '../../src/systems/smooth-scroll-system'

import type { ItemLocationCallbackParams } from '../../src/dataTypes'

function baseParams(overrides: Partial<ItemLocationCallbackParams> = {}): ItemLocationCallbackParams {
  return {
    atBottom: false,
    context: undefined,
    data: [],
    scrollInProgress: false,
    scrollLocation: {
      bottomOffset: 100,
      isAtBottom: false,
      lastItemBottomOffset: 0,
      lastVisibleItemIndex: 0,
      listOffset: 0,
      scrollHeight: 400,
      visibleListHeight: 400,
    },
    ...overrides,
  }
}

describe('resolveAutoscroll', () => {
  it('false -> none', () => {
    expect(resolveAutoscroll(false, baseParams())).toEqual({ kind: 'none' })
  })

  it('undefined -> none', () => {
    expect(resolveAutoscroll(undefined, baseParams())).toEqual({ kind: 'none' })
  })

  it('true when atBottom -> bottom auto', () => {
    expect(resolveAutoscroll(true, baseParams({ atBottom: true }))).toEqual({ kind: 'bottom', behavior: 'auto' })
  })

  it('true when not atBottom -> none', () => {
    expect(resolveAutoscroll(true, baseParams({ atBottom: false }))).toEqual({ kind: 'none' })
  })

  it('ScrollBehavior string when atBottom -> bottom with that behavior', () => {
    expect(resolveAutoscroll('smooth', baseParams({ atBottom: true }))).toEqual({ kind: 'bottom', behavior: 'smooth' })
  })

  it('ScrollBehavior string when not atBottom -> none', () => {
    expect(resolveAutoscroll('smooth', baseParams({ atBottom: false }))).toEqual({ kind: 'none' })
  })

  it('numeric ItemLocation -> location regardless of atBottom', () => {
    expect(resolveAutoscroll(5, baseParams({ atBottom: false }))).toEqual({ kind: 'location', location: 5 })
  })

  it('ItemLocationWithAlign -> location', () => {
    const loc = { index: 3, align: 'center' as const, behavior: 'smooth' as const }
    expect(resolveAutoscroll(loc, baseParams())).toEqual({ kind: 'location', location: loc })
  })

  it('callback returning false -> none', () => {
    const cb = () => false as const
    expect(resolveAutoscroll(cb, baseParams())).toEqual({ kind: 'none' })
  })

  it('callback returning ScrollBehavior when atBottom -> bottom', () => {
    const cb = () => 'smooth' as const
    expect(resolveAutoscroll(cb, baseParams({ atBottom: true }))).toEqual({ kind: 'bottom', behavior: 'smooth' })
  })

  it('callback returning ItemLocation -> location', () => {
    const loc = { index: 'LAST' as const, align: 'end' as const }
    const cb = () => loc
    expect(resolveAutoscroll(cb, baseParams())).toEqual({ kind: 'location', location: loc })
  })

  it('callback receives params', () => {
    const params = baseParams({ atBottom: true, data: [{ id: 1 }] })
    const cb = vi.fn(() => false as const)
    resolveAutoscroll(cb, params)
    expect(cb).toHaveBeenCalledWith(params)
  })
})

describe('autoscrollParams', () => {
  it('reads current realm state', () => {
    const realm = new Realm()
    realm.pub(context$, 'ctx')
    // leave isAtBottom/scrollInProgress at defaults (false)
    const params = autoscrollParams(realm, [{ id: 1 }])
    expect(params.context).toBe('ctx')
    expect(params.data).toEqual([{ id: 1 }])
    expect(params.atBottom).toBe(false)
    expect(params.scrollInProgress).toBe(false)
  })
})

describe('connectAutoscrollSystem', () => {
  it('none directive does not publish', () => {
    const realm = new Realm()
    connectAutoscrollSystem(realm)
    const spy = vi.fn()
    realm.sub(scrollToLocation$, spy)
    realm.pub(scrollToBottom$, { directive: { kind: 'none' }, changeData: [], prevScrollTop: 0 })
    expect(spy).not.toHaveBeenCalled()
  })

  it('bottom directive publishes scrollToLocation', () => {
    const realm = new Realm()
    connectAutoscrollSystem(realm)
    const spy = vi.fn()
    realm.sub(scrollToLocation$, spy)
    realm.pub(scrollToBottom$, { directive: { kind: 'bottom', behavior: 'smooth' }, changeData: [{ id: 1 }], prevScrollTop: 0 })
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ isBottom: true, behavior: 'smooth' }))
  })

  it('location directive publishes scrollToLocation', () => {
    const realm = new Realm()
    connectAutoscrollSystem(realm)
    const spy = vi.fn()
    realm.sub(scrollToLocation$, spy)
    const location = { index: 5, align: 'start' as const }
    realm.pub(scrollToBottom$, { directive: { kind: 'location', location }, changeData: [], prevScrollTop: 0 })
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ isBottom: false, location }))
  })
})
