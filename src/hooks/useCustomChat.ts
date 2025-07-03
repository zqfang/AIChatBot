import { useState, useRef } from 'react';
import { generateId, Message } from 'ai';
import { ChatHandler, JSONValue, ChatEvent} from '@llamaindex/chat-ui';
import {invoke} from '@tauri-apps/api/core';


import {
  // ChatMemoryBuffer,
  // LlamaCloudIndex,
  // MessageContent,
  // Metadata,
  // MetadataMode,
  // NodeWithScore,
  // PromptTemplate,
  // VectorStoreIndex,
  // extractText,
  Settings
} from "llamaindex";

const TOKEN_DELAY = 20; // 20ms delay between tokens

const assistant =  async ({ message }: { message: Message }) => {
  // const stream = await Settings.llm.chat({ messages: filteredMessages, stream: true });
  const response = await invoke<Message>('chat_message', { message });
  // let response_content = "";
  // const stream = fakeChatStream(filteredMessages[filteredMessages.length - 1].content, response.content, []);
  // for await (const chunk of stream) {
  //   response_content += chunk.delta;  
  // }
  // console.log(response)
  return response;
}





// Extend the original ChatHandler interface
export interface CustomChatHandler extends ChatHandler {
    // Add your custom properties/methods here
    // error?: Error | null;
    // handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    resume: (eventType: string, eventData: JSONValue) => Promise<void>,
    event: ChatEvent | null
  }


  
export function useCustomChat(initialMessages: Message[] = []): CustomChatHandler {

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState<ChatEvent | null>(null);
  // const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
   
  const updateLastMessage = ({
    delta = '',
    annotations = [],
  }: {
    delta?: string // render events inline in markdown
    annotations?: JSONValue[] // render events in annotations components
  }) => {
    /// prev comes from React's state updater function. 
    // You don't define it - React provides it automatically.
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1]

      // if last message is assistant message, update its content
      if (lastMessage?.role === 'assistant') {
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: (lastMessage.content || '') + delta,
            annotations: [...(lastMessage.annotations || []), ...annotations],
          },
        ]
      }
      // if last message is user message, add a new assistant message
      return [...prev, {id: generateId(), content: delta, role: 'assistant', annotations }]
    })
  }

  // const append = useCallback(async (message: Message, options?: { data?: any }): Promise<string | null | undefined> => {
  //   setMessages(prev => [...prev, message]);
  //   return null;
  // }, []);


  // const stop = useCallback(() => {
  //   if (abortControllerRef.current) {
  //     abortControllerRef.current.abort();
  //     abortControllerRef.current = null;
  //   }
  //   setIsLoading(false);
  // }, []);

  const append = async (message: Omit<Message, 'id'>) => {
    const newMessage = { ...message, id: generateId() }
    setIsLoading(true)
    try {
      setMessages(prev => [...prev, newMessage]);
      const assistantMsg = await assistant({ message: newMessage }) // TODO: call LLM response here
      // console.log(assistantMsg)
      // Create assistant message with empty content first
      const assistantMessageId = generateId();
      setMessages(prev => [...prev, { 
        id: assistantMessageId, 
        role: "assistant", 
        content: "", 
        annotations: []
      }]);

          // Stream the response content
    const respMsg = "User:  " + newMessage.content + "\n\n\nAI:  " + assistantMsg.content;
    await streamText(respMsg, assistantMessageId);

    } catch (error) {
      console.error('Error appending message:', error);
      console.error(error);
    }
    setIsLoading(false)
    setInput('')
    return newMessage.content
  }
  const streamText = async (text: string, messageId: string) => {
    const chars = text.split('');
    let currentText = '';
    
    for (let i = 0; i < chars.length; i++) {
      currentText += chars[i];
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: currentText }
            : msg
        )
      );
      
      // Add a small delay for streaming effect
      await new Promise(resolve => setTimeout(resolve, TOKEN_DELAY)); // 20ms delay
    }
  }
    // const handleSubmit = async () => {
    // if (input.trim()) {
    //   append({ id: generateId(), content: input, role: "user" });
    //   append({ id: generateId(), content: "...", role: "assistant" });

    //   try {
    //     const userInput = input;
    //     setInput("");

    //     const responseStream = assistant.getResponseStream(userInput);
    //     let botMessage = "";
    //     for await (const chunk of responseStream) {
    //       botMessage += chunk;
    //       setMessages((prevMessages) => {
    //         const updatedMessages = [...prevMessages];
    //         const lastMessageIndex = updatedMessages.length - 1;
    //         updatedMessages[lastMessageIndex] = {
    //           ...updatedMessages[lastMessageIndex],
    //           text: botMessage,
    //         };
    //         return updatedMessages;
    //       });
    //     }
    //   } catch (error) {
    //     setInput("");

    //     append({
    //       content: "Could not process your request, Try again!",
    //       role: "assistant",
    //     });
    //   }
    // }
    //};
  const handleStop = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }

  const handleReload = async () => {
    console.log('handleReload is called');
    const lastUserMessage = [...messages]
      .reverse()
      .find(message => message.role === 'user')

    if (!lastUserMessage) return

    const chatHistory = messages.slice(0, -2)
    setMessages([...chatHistory, lastUserMessage])
  }

  // resume is used to send events to the current workflow run without creating a new task
  const handleResume = async (eventType: string, eventData: any) => {
      setIsLoading(true);
      console.log('handleResume is called');
      setEvent({ type: eventType as ChatEvent['type'], data: eventData })
      updateLastMessage({ delta: eventData.delta, annotations: eventData.annotations })
      setIsLoading(false);
      // try {
      //   await sendEvent({ type: eventType as ChatEvent['type'], data: eventData })
      // } catch (error) {
      //   onError?.(error)
      // }
  }
  
  return {
    input,
    setInput,
    isLoading,
    append,
    messages,
    setMessages, //or setMessages: setMessages as ChatHandler['setMessages'],
    stop: handleStop,
    reload: handleReload,
    resume: handleResume,
    event
  }
}