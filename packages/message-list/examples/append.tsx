import { useState } from 'react'

import { VirtuosoMessageList } from '../src'

function makeMessages(n: number) {
  return Array.from({ length: n }, (_, i) => `Message ${i}`)
}

export function Example() {
  const [renderKey, setRenderKey] = useState(0)
  const data = makeMessages(50)

  return (
    <>
      <button
        data-testid="rerender"
        onClick={() => {
          setRenderKey((k) => k + 1)
        }}
      >
        Rerender {renderKey}
      </button>
      <VirtuosoMessageList
        key={renderKey}
        initialData={data}
        ItemContent={({ data: item }) => <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{item}</div>}
        style={{ height: 300, border: '1px solid #ccc' }}
      />
    </>
  )
}
