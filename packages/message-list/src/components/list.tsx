import * as React from 'react'

import { useCellValues } from '@virtuoso.dev/gurx'

import { data$ } from '../systems/data-system'
import { visibleRange$ } from '../systems/range-system'
import { listHeight$, offsetOfIndex, offsetTree$ } from '../systems/size-system'
import { computeKey } from '../utils/key-manager'
import { Item } from './item'
import { useListRenderConfig } from './list-context'

export function List<Data>() {
  const { context, computeItemKey, onRenderedDataChange } = useListRenderConfig<Data, unknown>()
  const [range, offsets, height, items] = useCellValues(visibleRange$, offsetTree$, listHeight$, data$) as [
    { start: number; end: number },
    import('../utils/a-a-tree').AANode<number>,
    number,
    Data[],
  ]

  React.useEffect(() => {
    if (!onRenderedDataChange || items.length === 0) return
    const slice = items.slice(range.start, range.end + 1)
    onRenderedDataChange(slice as unknown as never)
  }, [items, range.start, range.end, onRenderedDataChange])

  if (items.length === 0) return null

  const start = Math.min(range.start, items.length - 1)
  const end = Math.min(range.end, items.length - 1)

  const children: React.ReactNode[] = []
  for (let index = start; index <= end; index++) {
    const datum = items[index] as Data
    children.push(
      <Item
        key={computeKey(datum, index, context as unknown, computeItemKey as never)}
        index={index}
        offset={offsetOfIndex(offsets, index)}
        data={datum}
        prevData={(items[index - 1] as Data | undefined) ?? null}
        nextData={(items[index + 1] as Data | undefined) ?? null}
      />
    )
  }

  return (
    <div style={{ position: 'relative', height, width: '100%' }} data-virtuoso-list>
      {children}
    </div>
  )
}
