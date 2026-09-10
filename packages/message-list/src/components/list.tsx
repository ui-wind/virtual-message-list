import * as React from 'react'

import { useCellValues } from '@virtuoso.dev/gurx'

import { data$ } from '../systems/data-system'
import { visibleRange$ } from '../systems/range-system'
import { listHeight$, offsetOfIndex, offsetTree$ } from '../systems/size-system'
import { computeKey } from '../utils/key-manager'
import { Item } from './item'
import { useListRenderConfig } from './list-context'

/**
 * Renders the windowed slice of the data. Data and context flow through the
 * realm/config as erased `unknown`; per-item typing happens inside `ItemContent`,
 * so the list itself stays `unknown`-typed and free of downcasts.
 */
export function List() {
  const { context, computeItemKey, onRenderedDataChange } = useListRenderConfig<unknown, unknown>()
  const [range, offsets, height, items] = useCellValues(visibleRange$, offsetTree$, listHeight$, data$)

  React.useEffect(() => {
    if (!onRenderedDataChange || items.length === 0) {
      return
    }
    onRenderedDataChange(items.slice(range.start, range.end + 1))
  }, [items, range.start, range.end, onRenderedDataChange])

  if (items.length === 0) {
    return null
  }

  const start = Math.min(range.start, items.length - 1)
  const end = Math.min(range.end, items.length - 1)

  const children: React.ReactNode[] = []
  for (let index = start; index <= end; index++) {
    const datum = items[index]
    children.push(
      <Item
        key={computeKey(datum, index, context, computeItemKey)}
        index={index}
        offset={offsetOfIndex(offsets, index)}
        data={datum}
        prevData={items[index - 1] ?? null}
        nextData={items[index + 1] ?? null}
      />
    )
  }

  return (
    <div style={{ position: 'relative', height, width: '100%' }} data-virtuoso-list>
      {children}
    </div>
  )
}
