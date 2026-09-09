import * as React from 'react'

import { useItemObserver, useListRenderConfig } from './list-context'

import type { ItemContent } from '../types'

interface ItemProps<Data> {
  index: number
  offset: number
  data: Data
  prevData: Data | null
  nextData: Data | null
}

/**
 * A single windowed item: an absolutely positioned row that reports its size to
 * the shared ResizeObserver and renders the user `ItemContent` slot. The
 * `data-index` attribute is what the observer callback reads back to publish
 * the size into the size tree.
 */
export function Item<Data>({ index, offset, data, prevData, nextData }: ItemProps<Data>) {
  const { context, ItemContent } = useListRenderConfig<Data, unknown>()
  const observer = useItemObserver()
  const nodeRef = React.useRef<HTMLDivElement | null>(null)

  React.useLayoutEffect(() => {
    const el = nodeRef.current
    if (!el || !observer) return
    observer.observe(el)
    return () => observer.unobserve(el)
  }, [observer, index])

  if (!ItemContent) return null

  return (
    <div ref={nodeRef} data-index={index} style={{ position: 'absolute', top: offset, width: '100%' }}>
      <TypedItemContent
        ItemContent={ItemContent as ItemContent<Data, unknown>}
        index={index}
        data={data}
        prevData={prevData}
        nextData={nextData}
        context={context}
      />
    </div>
  )
}

function TypedItemContent<Data>(props: {
  ItemContent: ItemContent<Data, unknown>
  index: number
  data: Data
  prevData: Data | null
  nextData: Data | null
  context: unknown
}) {
  const { ItemContent, index, data, prevData, nextData, context } = props
  return <ItemContent index={index} data={data} prevData={prevData} nextData={nextData} context={context} />
}
