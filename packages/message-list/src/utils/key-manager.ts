import type { VirtuosoMessageListProps } from '../types'

type ComputeItemKey<Data, Context> = NonNullable<VirtuosoMessageListProps<Data, Context>['computeItemKey']>

export function computeKey<Data, Context>(
  data: Data,
  index: number,
  context: Context,
  computeItemKey: ComputeItemKey<Data, Context> | undefined
): React.Key {
  if (computeItemKey) {
    return computeItemKey({ data, index, context })
  }
  return index
}

export function identityOf<Data>(item: Data, itemIdentity: ((item: Data) => unknown) | undefined): unknown {
  return itemIdentity ? itemIdentity(item) : item
}

/**
 * Prepend invariant: older items were pushed onto the head while the existing
 * items stay intact and in order at the tail. That means `prevData` must be a
 * contiguous suffix of `nextData`, and `nextData` must be strictly longer.
 *
 * An append (or any in-place update) grows/mutates the tail and keeps the head,
 * so the old first item is still present — but that alone does NOT make it a
 * prepend. Matching only the head is what wrongly classified appends as
 * prepends and purged every measured size on each data flush.
 */
export function isPrependExtension<Data>(prevData: Data[], nextData: Data[], itemIdentity: ((item: Data) => unknown) | undefined): boolean {
  // Initial load (first page arriving) is treated as a prepend. The size tree is
  // empty at this point, so the resulting purge is a harmless no-op.
  if (prevData.length === 0) {
    return true
  }
  if (nextData.length <= prevData.length) {
    return false
  }
  const offset = nextData.length - prevData.length
  for (let i = 0; i < prevData.length; i++) {
    if (identityOf(nextData[offset + i]!, itemIdentity) !== identityOf(prevData[i]!, itemIdentity)) {
      return false
    }
  }
  return true
}
