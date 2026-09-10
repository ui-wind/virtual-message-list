import { VirtuosoMessageList } from '../src'

export function Example() {
  return (
    <VirtuosoMessageList
      initialData={Array.from({ length: 20 }, (_, i) => `Message ${i}`)}
      ItemContent={({ data }) => <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{data}</div>}
      Header={({ context }) => <div style={{ padding: 8, background: '#def' }}>{context}</div>}
      Footer={({ context }) => <div style={{ padding: 8, background: '#fed' }}>{context}</div>}
      context="section header/footer"
      EmptyPlaceholder={() => <div>empty</div>}
      style={{ height: 300, border: '1px solid #ccc' }}
    />
  )
}
