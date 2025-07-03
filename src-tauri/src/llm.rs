use rig::completion::Chat;
use rig::providers::openai;
use rig::agent::Agent;
use rig::completion::Message;

use rig::client::{CompletionClient, ProviderClient};
use rig::streaming::{stream_to_stdout, StreamingCompletionResponse, StreamingChat};
use futures::StreamExt;
// use tauri::State;
// use std::sync::Mutex;
// use tauri::Manager;




pub struct AIProvider{
    llm: Agent<openai::CompletionModel>, // ai provider
    memory: Vec<Message>, // memory of the chat, chat history
}

impl AIProvider {
    pub fn default() -> Self {
    // Create OpenAI client and model
    // This requires the `OPENAI_API_KEY` environment variable to be set.
    let openai_client = openai::Client::from_env();
        Self {
            llm: openai_client.agent("gpt-4o-mini").build(),
            memory: Vec::new(),
        }
    }
    pub async fn chat(&mut self, message: Message) -> String {

        let response = self.llm.chat(message.clone(), 
            self.memory.clone())
        .await
        .expect("Failed to prompt GPT-4");
        // add the message to the memory
        self.memory.push(message);
        self.memory.push(Message::assistant(&response));
        response
    }
    pub async fn chat_stream(
        &mut self,
        message: Message,
    ) -> StreamingCompletionResponse<rig::providers::openai::StreamingCompletionResponse> {
        let mut stream = self
            .llm
            .stream_chat(message.clone(), self.memory.clone())
            .await
            .expect("Failed to prompt GPT-4");
        self.memory.push(message);

        let mut result = String::new();
        while let Some(chunk) = stream.next().await {
            if let Ok(chunk) = chunk {
                match chunk {
                    rig::completion::AssistantContent::Text(text) => {
                        result.push_str(text.text.as_str());
                    }
                    _ => {} // handle other content types if needed
                }
            }
        }
        self.memory.push(Message::assistant(result));
        stream
    }
}
