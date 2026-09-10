import * as React from 'react'

import { VirtuosoMessageList } from '../src'

import type { VirtuosoMessageListMethods } from '../src/dataTypes'

export function Example() {
  const ref = React.useRef<VirtuosoMessageListMethods<string>>(null)

  return (
    <>
      <button
        data-testid="append"
        onClick={() => {
          ref.current?.data.append([`Message ${Math.random().toString(36).slice(2, 6)}`])
        }}
      >
        Append
      </button>
      <button
        data-testid="prepend"
        onClick={() => {
          ref.current?.data.prepend([`Old message ${Math.random().toString(36).slice(2, 6)}`])
        }}
      >
        Prepend
      </button>
      <VirtuosoMessageList
        ref={ref}
        initialData={Array.from({ length: 30 }, (_, i) => `Message ${i}`)}
        ItemContent={({ data }) => <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{data}</div>}
        style={{ height: 300, border: '1px solid #ccc' }}
      />
    </>
  )
}
