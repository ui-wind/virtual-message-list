import { useCurrentlyRenderedData, useVirtuosoLocation, useVirtuosoMethods, VirtuosoMessageList } from '../src'

import type { ContextAwareComponent } from '../src/types'

interface Message {
  text: string
}

interface MsgContext {
  user: string
}

// useVirtuosoMethods + useVirtuosoLocation: a scroll-to-bottom button that
// appears only when the user has scrolled away from the latest message.
function ScrollToBottom() {
  const methods = useVirtuosoMethods<Message, MsgContext>()
  const { isAtBottom } = useVirtuosoLocation()

  if (isAtBottom) {
    return null
  }

  return (
    <button
      onClick={() => {
        methods.scrollToItem({ index: 'LAST', align: 'end', behavior: 'smooth' })
      }}
      style={{ padding: '6px 12px', cursor: 'pointer' }}
    >
      Scroll to bottom
    </button>
  )
}

// useCurrentlyRenderedData: reports which slice of the data is in the window.
function RenderedRange() {
  const rendered = useCurrentlyRenderedData<Message>()
  const first = rendered[0]?.text ?? '—'
  const last = rendered[rendered.length - 1]?.text ?? '—'

  return (
    <div style={{ padding: '6px 12px', background: '#f0f0f0', fontSize: 12 }}>
      Rendering {rendered.length} items: {first} … {last}
    </div>
  )
}

const Header: ContextAwareComponent<MsgContext> = () => <RenderedRange />

const StickyFooter: ContextAwareComponent<MsgContext> = () => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 8, background: '#fff', borderTop: '1px solid #ccc' }}>
    <ScrollToBottom />
  </div>
)

export function Example() {
  const data = Array.from({ length: 100 }, (_, i) => ({ text: `Message ${i}` }))

  return (
    <VirtuosoMessageList<Message, MsgContext>
      initialData={data}
      context={{ user: 'me' }}
      ItemContent={({ data: item }) => <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{item.text}</div>}
      Header={Header}
      StickyFooter={StickyFooter}
      style={{ height: 400, border: '1px solid #ccc' }}
    />
  )
}
