import { describe, expect, it } from 'vitest'

import { normalizeLocation, resolveIndex, scrollToBottomAlways, scrollToBottomIfAtBottom } from '../../src/utils/scroll-helpers'

import type { ItemLocationCallbackParams, ListScrollLocation } from '../../src/dataTypes'

const scrollLocation: ListScrollLocation = {
  listOffset: 0,
  visibleListHeight: 100,
  scrollHeight: 100,
  bottomOffset: 0,
  isAtBottom: false,
  lastVisibleItemIndex: 0,
  lastItemBottomOffset: 0,
}

function params(overrides: Partial<Pick<ItemLocationCallbackParams, 'atBottom' | 'scrollInProgress'>> = {}): ItemLocationCallbackParams {
  return {
    scrollLocation,
    scrollInProgress: false,
    atBottom: false,
    data: [],
    context: {},
    ...overrides,
  }
}

describe('scrollToBottomIfAtBottom', () => {
  it('returns smooth when atBottom', () => {
    expect(scrollToBottomIfAtBottom(params({ atBottom: true }))).toBe('smooth')
  })

  it('returns smooth when scrollInProgress', () => {
    expect(scrollToBottomIfAtBottom(params({ scrollInProgress: true }))).toBe('smooth')
  })

  it('returns false when neither', () => {
    expect(scrollToBottomIfAtBottom(params())).toBe(false)
  })
})

describe('scrollToBottomAlways', () => {
  it('returns LAST end smooth', () => {
    expect(scrollToBottomAlways()).toEqual({ index: 'LAST', align: 'end', behavior: 'smooth' })
  })
})

describe('resolveIndex', () => {
  it('resolves numeric index', () => {
    expect(resolveIndex(3, 10)).toBe(3)
  })

  it('resolves LAST to last index', () => {
    expect(resolveIndex('LAST', 10)).toBe(9)
  })

  it('resolves LAST with empty list to 0', () => {
    expect(resolveIndex('LAST', 0)).toBe(0)
  })
})

describe('normalizeLocation', () => {
  it('normalizes number to ItemLocationWithAlign', () => {
    expect(normalizeLocation(5)).toEqual({ index: 5, align: 'start', behavior: 'auto' })
  })

  it('passes through object location', () => {
    const loc = { index: 3, align: 'center' as const }
    expect(normalizeLocation(loc)).toBe(loc)
  })
})
