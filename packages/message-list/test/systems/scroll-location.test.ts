import { Realm } from '@virtuoso.dev/gurx'
import { describe, expect, it } from 'vitest'

import { scrollTop$ } from '../../src/systems/dom-system'
import { isAtBottom$ } from '../../src/systems/is-at-bottom-system'
import { listScrollLocation$ } from '../../src/systems/scroll-location-system'
import { defaultItemSize$, itemCount$ } from '../../src/systems/size-system'
import { viewportHeight$ } from '../../src/systems/viewport-system'

describe('listScrollLocation', () => {
  // Register the derived outputs first so input pubs propagate synchronously.
  function makeRealm() {
    const r = new Realm()
    r.getValue(listScrollLocation$)
    r.getValue(isAtBottom$)
    return r
  }

  it('produces base fields when empty', () => {
    const r = makeRealm()
    r.pub(itemCount$, 0)
    r.pub(defaultItemSize$, 50)
    r.pub(viewportHeight$, 400)
    r.pub(scrollTop$, 0)
    const loc = r.getValue(listScrollLocation$)
    expect(loc.scrollHeight).toBe(0)
    expect(loc.visibleListHeight).toBe(400)
    expect(loc.lastVisibleItemIndex).toBe(0)
    expect(loc.lastItemBottomOffset).toBe(0)
  })

  it('computes lastVisibleItemIndex and bottomOffset', () => {
    const r = makeRealm()
    // 10 items * 50 = 500 height, viewport 100, scrollTop 0
    r.pub(defaultItemSize$, 50)
    r.pub(itemCount$, 10)
    r.pub(viewportHeight$, 100)
    r.pub(scrollTop$, 0)
    const loc = r.getValue(listScrollLocation$)
    expect(loc.scrollHeight).toBe(500)
    expect(loc.listOffset).toBe(0)
    // viewportBottom = 100, item at offset 100 is index 2 (0,50,100)
    expect(loc.lastVisibleItemIndex).toBe(2)
  })

  it('lastItemBottomOffset is item bottom minus viewport bottom', () => {
    const r = makeRealm()
    r.pub(defaultItemSize$, 50)
    r.pub(itemCount$, 10)
    r.pub(viewportHeight$, 100)
    r.pub(scrollTop$, 0)
    const loc = r.getValue(listScrollLocation$)
    // item 2: offset 100 + size 50 = 150, viewportBottom 100 => 50
    expect(loc.lastItemBottomOffset).toBe(50)
  })

  it('isAtBottom reflects bottom distance', () => {
    const r = makeRealm()
    r.pub(defaultItemSize$, 50)
    r.pub(itemCount$, 10) // height 500
    r.pub(viewportHeight$, 100)
    r.pub(scrollTop$, 400) // bottom
    expect(r.getValue(isAtBottom$)).toBe(true)
    expect(r.getValue(listScrollLocation$).isAtBottom).toBe(true)
  })
})
