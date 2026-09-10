import { describe, expect, it } from 'vitest'

import { computeKey, identityOf, isPrependExtension } from '../../src/utils/key-manager'

describe('computeKey', () => {
  it('returns index when no computeItemKey', () => {
    expect(computeKey({ id: 1 }, 3, {}, undefined)).toBe(3)
  })

  it('delegates to computeItemKey when provided', () => {
    const fn = ({ data, index }: { data: { id: number }; index: number }) => `${data.id}-${index}`
    expect(computeKey({ id: 42 }, 7, {}, fn)).toBe('42-7')
  })

  it('passes context through', () => {
    const fn = ({ context }: { context: string }) => context
    expect(computeKey({}, 0, 'hello', fn)).toBe('hello')
  })
})

describe('identityOf', () => {
  it('returns item itself when no identity fn', () => {
    const item = { id: 1 }
    expect(identityOf(item, undefined)).toBe(item)
  })

  it('applies identity function', () => {
    expect(identityOf({ id: 99 }, (x: { id: number }) => x.id)).toBe(99)
  })
})

describe('isPrependExtension', () => {
  it('returns true for empty prevData', () => {
    expect(isPrependExtension([], [1, 2, 3], undefined)).toBe(true)
  })

  it('returns false when nextData shorter than prevData', () => {
    expect(isPrependExtension([1, 2, 3], [2, 3], undefined)).toBe(false)
  })

  it('returns true when prevData is a contiguous suffix of nextData', () => {
    expect(isPrependExtension([2, 3], [1, 2, 3], undefined)).toBe(true)
  })

  it('returns false when nextData is an append (head preserved, tail grown)', () => {
    // Regression: an append keeps the old first item present, which the previous
    // head-match heuristic wrongly treated as a prepend, purging measured sizes.
    expect(isPrependExtension([1, 2], [1, 2, 3], undefined)).toBe(false)
  })

  it('returns false when prevData is not an intact suffix of nextData', () => {
    expect(isPrependExtension([2, 3], [4, 5, 6], undefined)).toBe(false)
  })

  it('returns false when same length (in-place update)', () => {
    expect(isPrependExtension([1, 2, 3], [4, 5, 6], undefined)).toBe(false)
  })

  it('uses identity function for comparison', () => {
    const id = (x: { id: number }) => x.id
    expect(isPrependExtension([{ id: 1 }], [{ id: 0 }, { id: 1 }], id)).toBe(true)
    expect(isPrependExtension([{ id: 1 }], [{ id: 1 }, { id: 2 }], id)).toBe(false)
    expect(isPrependExtension([{ id: 1 }], [{ id: 2 }, { id: 3 }], id)).toBe(false)
  })
})
