import {
  ChatCanvas,
  ChatInput,
  ChatMessage,
  ChatMessages,
  ChatSection,
  useChatUI,
} from '@llamaindex/chat-ui'
import { Message } from 'ai/react'
import { WeatherAnnotation } from './components/custom-weather'
import { WikiCard } from './components/custom-wiki'
import {useCustomChat} from './hooks/useCustomChat'

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! How can I help you today?',
    role: 'assistant',
  },
]

export default function App(): React.JSX.Element {
  return (
    <div className="flex h-screen flex-col">
      <header className="w-full border-b p-4 text-center">
        <h1 className="text-2xl font-bold">
          A Simple AI Chatbot
        </h1>
        <p className="text-gray-600">
          Built with  Vite + React + Tauri + LlamaIndexChatUI
        </p>
      </header>
      <div className="min-h-0 flex-1"
            style={{ height: "calc(100vh - 40px - 10rem)", marginTop: "40px" }}>
        <ChatView />
      </div>
    </div>
  )
}

function ChatView() {
  const handler = useCustomChat(initialMessages)

  return (
    <ChatSection
      handler={handler}
      className="block h-full flex-row gap-4 p-0 md:flex md:p-5"
    >
      <div className="md:max-w-1/2 mx-auto flex h-full min-w-0 max-w-full flex-1 flex-col gap-4">
        <ChatMessages>
          <ChatMessages.List className="px-4 py-6">
            <CustomChatMessages />
          </ChatMessages.List>
        </ChatMessages>
        <div className="border-t p-4">
          <ChatInput>
            <ChatInput.Form>
              <ChatInput.Field placeholder="Type your message..." />
              <ChatInput.Submit />
            </ChatInput.Form>
          </ChatInput>
        </div>
      </div>
      <ChatCanvas className="w-full md:w-2/3" />
    </ChatSection>
  )
}

function CustomChatMessages() {
  const { messages, isLoading, append } = useChatUI()

  return (
    <>
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          isLast={index === messages.length - 1}
          className="mb-4"
        >
          <ChatMessage.Avatar>
            {/* <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
              {message.role === 'user' ? 'U' : 'AI'}
            </div> */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white-500 text-sm font-semibold text-white">
              <img
                src={message.role === "user" ? "/user.png" : "/bot.png"}
                alt={message.role}
                className={`${message.role === "user" ? "scale-50" : ""} w-8 h-8`}
              />
            </div>
          </ChatMessage.Avatar>
          <ChatMessage.Content isLoading={isLoading} append={append}>
            <ChatMessage.Content.Markdown
              annotationRenderers={{
                // these annotations are rendered inline with the Markdown text
                artifact: ChatCanvas.Artifact,
                wiki: WikiCard,
              }}
            />

            {/* annotation components under the Markdown text */}
            <WeatherAnnotation />
            <ChatMessage.Content.Source />
          </ChatMessage.Content>
          <ChatMessage.Actions />
        </ChatMessage>
      ))}
    </>
  )
}
