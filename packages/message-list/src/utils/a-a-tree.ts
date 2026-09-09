interface NilNode {
  lvl: 0
}

const NIL: NilNode = { lvl: 0 }

export type AANode<T> = NilNode | NonNilAANode<T>

export interface NodeData<T> {
  k: number
  v: T
}

export interface Range<T> {
  start: number
  end: number
  value: T
}

interface NonNilAANode<T> {
  k: number
  v: T
  lvl: number
  l: AANode<T>
  r: AANode<T>
}

export function newTree<T>(): AANode<T> {
  return NIL
}

export function empty(node: AANode<unknown>): node is NilNode {
  return node === NIL
}

export function find<T>(node: AANode<T>, key: number): T | undefined {
  if (empty(node)) return undefined
  if (key === node.k) return node.v
  return key < node.k ? find(node.l, key) : find(node.r, key)
}

export function findMaxKeyValue<T>(node: AANode<T>, value: number, field: 'k' | 'v' = 'k'): [number, T | undefined] {
  if (empty(node)) return [-Infinity, undefined]
  if (Number(node[field]) === value) return [node.k, node.v]
  if (Number(node[field]) < value) {
    const r = findMaxKeyValue(node.r, value, field)
    return r[0] === -Infinity ? [node.k, node.v] : r
  }
  return findMaxKeyValue(node.l, value, field)
}

export function insert<T>(node: AANode<T>, k: number, v: T): NonNilAANode<T> {
  if (empty(node)) return mk(k, v, 1)
  if (k === node.k) return clone(node, { k, v })
  if (k < node.k) return rebalance(clone(node, { l: insert(node.l, k, v) }))
  return rebalance(clone(node, { r: insert(node.r, k, v) }))
}

export function remove<T>(node: AANode<T>, key: number): AANode<T> {
  if (empty(node)) return NIL
  const { k, l, r } = node
  if (key === k) {
    if (empty(l)) return r
    if (empty(r)) return l
    const [lastKey, lastValue] = last(l)
    return adjust(clone(node, { k: lastKey, v: lastValue, l: deleteLast(l) }))
  }
  return key < k ? adjust(clone(node, { l: remove(l, key) })) : adjust(clone(node, { r: remove(r, key) }))
}

export function walk<T>(node: AANode<T>): NodeData<T>[] {
  if (empty(node)) return []
  return [...walk(node.l), { k: node.k, v: node.v }, ...walk(node.r)]
}

export function ranges<T>(node: AANode<T>): Range<T>[] {
  return toRanges(walk(node))
}

export function rangesWithin<T>(node: AANode<T>, start: number, end: number): Range<T>[] {
  if (empty(node)) return []
  const adjustedStart = findMaxKeyValue(node, start)[0]
  return toRanges(walkWithin(node, adjustedStart, end))
}

// -- internal helpers

function walkWithin<T>(node: AANode<T>, start: number, end: number): NodeData<T>[] {
  if (empty(node)) return []
  const { k, l, r, v } = node
  let result: NodeData<T>[] = []
  if (k > start) result = result.concat(walkWithin(l, start, end))
  if (k >= start && k <= end) result.push({ k, v })
  if (k <= end) result = result.concat(walkWithin(r, start, end))
  return result
}

function toRanges<T>(nodes: NodeData<T>[]): Range<T>[] {
  if (nodes.length === 0) return []
  const result: Range<T>[] = []
  for (let i = 0; i < nodes.length; i++) {
    const cur = nodes[i]!
    const nxt = nodes[i + 1]
    result.push({ start: cur.k, end: nxt ? nxt.k - 1 : Infinity, value: cur.v })
  }
  return result
}

function isSingle(node: AANode<unknown>): boolean {
  return empty(node) || node.lvl > node.r.lvl
}

function last<T>(node: NonNilAANode<T>): [number, T] {
  return empty(node.r) ? [node.k, node.v] : last(node.r)
}

function deleteLast<T>(node: NonNilAANode<T>): AANode<T> {
  return empty(node.r) ? node.l : adjust(clone(node, { r: deleteLast(node.r) }))
}

function mk<T>(k: number, v: T, lvl: number, l: AANode<T> = NIL, r: AANode<T> = NIL): NonNilAANode<T> {
  return { k, v, lvl, l, r }
}

function clone<T>(node: NonNilAANode<T>, patch: Partial<NonNilAANode<T>>): NonNilAANode<T> {
  return mk(patch.k ?? node.k, patch.v ?? node.v, patch.lvl ?? node.lvl, patch.l ?? node.l, patch.r ?? node.r)
}

function skew<T>(node: NonNilAANode<T>): NonNilAANode<T> {
  const { l } = node
  return !empty(l) && l.lvl === node.lvl ? clone(l, { r: clone(node, { l: l.r }) }) : node
}

function split<T>(node: NonNilAANode<T>): NonNilAANode<T> {
  const { lvl, r } = node
  return !empty(r) && !empty(r.r) && r.lvl === lvl && r.r.lvl === lvl ? clone(r, { l: clone(node, { r: r.l }), lvl: lvl + 1 }) : node
}

function rebalance<T>(node: NonNilAANode<T>): NonNilAANode<T> {
  return split(skew(node))
}

function adjust<T>(node: NonNilAANode<T>): NonNilAANode<T> {
  const { l, lvl, r } = node
  if (r.lvl >= lvl - 1 && l.lvl >= lvl - 1) return node
  if (lvl > r.lvl + 1) {
    if (isSingle(l)) return skew(clone(node, { lvl: lvl - 1 }))
    if (!empty(l) && !empty(l.r)) {
      return clone(l.r, {
        l: clone(l, { r: l.r.l }),
        lvl,
        r: clone(node, { l: l.r.r, lvl: lvl - 1 }),
      })
    }
    throw new Error('Unexpected empty nodes')
  }
  if (isSingle(node)) return split(clone(node, { lvl: lvl - 1 }))
  if (!empty(r) && !empty(r.l)) {
    const rl = r.l
    const rlvl = isSingle(rl) ? r.lvl - 1 : r.lvl
    return clone(rl, {
      l: clone(node, { lvl: lvl - 1, r: rl.l }),
      lvl: rl.lvl + 1,
      r: split(clone(r, { l: rl.r, lvl: rlvl })),
    })
  }
  throw new Error('Unexpected empty nodes')
}
