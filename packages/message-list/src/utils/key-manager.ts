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
 * For prepend invariant: new data must extend current data — the first old
 * item must still be present in the new array (by identity).
 */
export function isPrependExtension<Data>(prevData: Data[], nextData: Data[], itemIdentity: ((item: Data) => unknown) | undefined): boolean {
  if (prevData.length === 0) return true
  if (nextData.length < prevData.length) return false
  const firstPrev = identityOf(prevData[0]!, itemIdentity)
  return nextData.some((item) => identityOf(item, itemIdentity) === firstPrev)
}
