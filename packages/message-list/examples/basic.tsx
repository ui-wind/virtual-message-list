import { VirtuosoMessageList } from '../src'

export function Example() {
  const data = Array.from({ length: 100 }, (_, i) => `Message ${i}`)

  return (
    <VirtuosoMessageList
      initialData={data}
      ItemContent={({ data: item }) => <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{item}</div>}
      style={{ height: 300, border: '1px solid #ccc' }}
    />
  )
}
