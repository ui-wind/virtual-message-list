import { useState } from 'react'

import { VirtuosoMessageList } from '../src'

export function Example() {
  const [data, setData] = useState(() => Array.from({ length: 30 }, (_, i) => `Item ${i}`))

  return (
    <>
      <button
        data-testid="add"
        onClick={() => {
          setData((prev) => [...prev, `Item ${prev.length}`])
        }}
      >
        Add one
      </button>
      <button
        data-testid="replace"
        onClick={() => {
          setData(Array.from({ length: 10 }, (_, i) => `New ${i}`))
        }}
      >
        Replace
      </button>
      <VirtuosoMessageList
        data={{ data }}
        ItemContent={({ data: item }) => <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{item}</div>}
        style={{ height: 300, border: '1px solid #ccc' }}
      />
    </>
  )
}
