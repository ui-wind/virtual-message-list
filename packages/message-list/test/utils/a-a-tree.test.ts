import { describe, expect, it } from 'vitest'

import { empty, find, findMaxKeyValue, insert, newTree, ranges, rangesWithin, remove, walk } from '../../src/utils/a-a-tree'

function buildTree<V>(entries: [number, V][]) {
  let tree = newTree<V>()
  for (const [k, v] of entries) {
    tree = insert(tree, k, v)
  }
  return tree
}

describe('newTree / empty', () => {
  it('a fresh tree is empty', () => {
    expect(empty(newTree())).toBe(true)
  })

  it('a tree with a node is not empty', () => {
    expect(empty(insert(newTree(), 1, 10))).toBe(false)
  })
})

describe('insert / find', () => {
  it('finds an inserted key', () => {
    const tree = buildTree([
      [1, 10],
      [2, 20],
      [3, 30],
    ])
    expect(find(tree, 2)).toBe(20)
  })

  it('returns undefined for a missing key', () => {
    const tree = buildTree([
      [1, 10],
      [3, 30],
    ])
    expect(find(tree, 2)).toBeUndefined()
  })

  it('overwrites a duplicate key', () => {
    let tree = insert(newTree(), 5, 1)
    tree = insert(tree, 5, 99)
    expect(find(tree, 5)).toBe(99)
    expect(walk(tree)).toHaveLength(1)
  })

  it('maintains sorted order regardless of insert order', () => {
    const tree = buildTree([
      [5, 50],
      [1, 10],
      [3, 30],
      [2, 20],
      [4, 40],
    ])
    expect(walk(tree).map((n) => n.k)).toEqual([1, 2, 3, 4, 5])
  })
})

describe('remove', () => {
  it('removes an existing key', () => {
    const tree = buildTree([
      [1, 10],
      [2, 20],
      [3, 30],
    ])
    const next = remove(tree, 2)
    expect(find(next, 2)).toBeUndefined()
    expect(walk(next).map((n) => n.k)).toEqual([1, 3])
  })

  it('removing a missing key is a no-op', () => {
    const tree = buildTree([
      [1, 10],
      [3, 30],
    ])
    const next = remove(tree, 2)
    expect(walk(next).map((n) => n.k)).toEqual([1, 3])
  })

  it('removing all keys yields an empty tree', () => {
    let tree = buildTree([
      [1, 10],
      [2, 20],
    ])
    tree = remove(tree, 1)
    tree = remove(tree, 2)
    expect(empty(tree)).toBe(true)
  })
})

describe('findMaxKeyValue', () => {
  const tree = buildTree([
    [0, 0],
    [10, 100],
    [20, 200],
    [30, 300],
  ])

  it('returns the pair with the greatest k <= value', () => {
    expect(findMaxKeyValue(tree, 25)).toEqual([20, 200])
  })

  it('returns exact match', () => {
    expect(findMaxKeyValue(tree, 20)).toEqual([20, 200])
  })

  it('returns -Infinity when value is below the smallest key', () => {
    expect(findMaxKeyValue(tree, -5)).toEqual([-Infinity, undefined])
  })

  it('searches by value field when specified', () => {
    // keyed by offset value; k of the node whose v <= 150 is 10
    expect(findMaxKeyValue(tree, 150, 'v')).toEqual([10, 100])
  })

  it('returns -Infinity on empty tree', () => {
    expect(findMaxKeyValue(newTree(), 5)).toEqual([-Infinity, undefined])
  })
})

describe('ranges / rangesWithin', () => {
  const tree = buildTree([
    [0, 'a'],
    [5, 'b'],
    [10, 'c'],
  ])

  it('produces contiguous ranges up to Infinity', () => {
    expect(ranges(tree)).toEqual([
      { start: 0, end: 4, value: 'a' },
      { start: 5, end: 9, value: 'b' },
      { start: 10, end: Infinity, value: 'c' },
    ])
  })

  it('rangesWithin snaps start to the preceding range and clips by end key', () => {
    // start 3 snaps to the range at k=0 (a), so both [0,a] and [5,b] are included;
    // k=10 is beyond end=8 and excluded.
    expect(rangesWithin(tree, 3, 8)).toEqual([
      { start: 0, end: 4, value: 'a' },
      { start: 5, end: Infinity, value: 'b' },
    ])
  })

  it('rangesWithin returns empty for empty tree', () => {
    expect(rangesWithin(newTree(), 0, 10)).toEqual([])
  })
})

describe('stress', () => {
  it('handles many sequential inserts and removes', () => {
    let tree = newTree<number>()
    for (let i = 0; i < 100; i++) {
      tree = insert(tree, i, i * 2)
    }
    for (let i = 0; i < 50; i++) {
      tree = remove(tree, i)
    }
    const keys = walk(tree).map((n) => n.k)
    expect(keys).toEqual(Array.from({ length: 50 }, (_, i) => i + 50))
    expect(find(tree, 99)).toBe(198)
    expect(find(tree, 0)).toBeUndefined()
  })
})
