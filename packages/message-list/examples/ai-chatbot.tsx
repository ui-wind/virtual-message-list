import { useState } from 'react'

import { VirtuosoMessageList } from '../src'

import type { DataWithScrollModifier, ScrollModifier } from '../src'

interface Message {
  key: string
  text: string
  user: 'me' | 'other'
}

let idCounter = 0

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore'.split(' ')

function randWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

function randText(min: number, max: number) {
  const count = min + Math.floor(Math.random() * (max - min))
  return Array.from({ length: count }, randWord).join(' ')
}

function randomMessage(user: Message['user']): Message {
  return { user, key: `${idCounter++}`, text: randText(user === 'me' ? 8 : 20, user === 'me' ? 14 : 40) }
}

const sendQuestion: ScrollModifier = {
  type: 'auto-scroll-to-bottom',
  autoScroll: ({ scrollInProgress, atBottom }) => ({
    // Local user action: intentionally bring the question into view.
    index: 'LAST',
    align: 'start',
    behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
  }),
}

const bringInReply: ScrollModifier = {
  type: 'item-location',
  location: { index: 'LAST', align: 'end' },
}

const keepPinned: ScrollModifier = {
  type: 'items-change',
  behavior: 'smooth',
}

export function Example() {
  const [data, setData] = useState<DataWithScrollModifier<Message>>({ data: [] })

  return (
    <div style={{ height: 500, display: 'flex', flexDirection: 'column', fontSize: 14 }}>
      <VirtuosoMessageList<Message, null>
        style={{ flex: 1, border: '1px solid #ccc' }}
        data={data}
        computeItemKey={({ data: item }) => item.key}
        shortSizeAlign="bottom-smooth"
        ItemContent={({ data: item }) => (
          <div style={{ paddingBottom: '2rem', display: 'flex' }}>
            <div
              style={{
                maxWidth: '80%',
                marginLeft: item.user === 'me' ? 'auto' : undefined,
                border: '1px solid #ddd',
                background: item.user === 'me' ? '#f0f0f0' : '#fff',
                borderRadius: '1rem',
                padding: '1rem',
              }}
            >
              {item.text}
            </div>
          </div>
        )}
      />

      <button
        style={{ marginTop: '1rem', fontSize: '1.1rem', padding: '1rem', cursor: 'pointer' }}
        onClick={(e) => {
          const button = e.currentTarget
          button.disabled = true

          const myMessage = randomMessage('me')
          setData((current) => ({ data: [...(current.data ?? []), myMessage], scrollModifier: sendQuestion }))

          setTimeout(() => {
            const botMessage = randomMessage('other')
            setData((current) => ({ data: [...(current.data ?? []), botMessage], scrollModifier: bringInReply }))

            let counter = 0
            const interval = setInterval(() => {
              if (counter++ > 20) {
                clearInterval(interval)
                button.disabled = false
              }

              setData((current) => ({
                data: (current.data ?? []).map((message) =>
                  message.key === botMessage.key ? { ...message, text: `${message.text} ${randWord()}` } : message
                ),
                scrollModifier: keepPinned,
              }))
            }, 150)
          }, 1000)
        }}
      >
        Ask the bot a question!
      </button>
    </div>
  )
}
