// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod llm;
// use tauri::State;
// use std::sync::Mutex;
use tokio::sync::Mutex; // use tokio::sync::Mutex instead of std::sync::Mutex for thead Send
use tauri::Manager;
use crate::llm::AIProvider;
use serde::{Deserialize, Serialize};
use rig::completion::Message;
// use rig::providers::openai::completion::Message;

#[derive(Debug, Serialize, Deserialize)]
struct ChatMessage {
    id: String,
    content: String,
    role: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChatResponse {
    id: String,
    content: String,
    role: String,
}

#[tauri::command]
async fn chat_message(message: ChatMessage, state: tauri::State<'_, Mutex<AIProvider>>) -> Result<ChatResponse, String> {
    // let last_message = messages.last().ok_or("No messages provided")?;
    // Convert ChatMessage to rig::message::Message
    let rig_messages: Message = 
            match message.role.as_str() {  
            "user" => Message::user(message.content.as_str()),
            "assistant" => Message::assistant(message.content.as_str()),
            _ => todo!(),
    };
    let mut state = state.lock().await;
    let response_content = state.chat(rig_messages).await;
    
    Ok(ChatResponse {
        id: "".to_string(),
        content: response_content,
        role: "assistant".to_string(),
    })
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat_message])
        .setup(|app| {
            app.manage(Mutex::new(AIProvider::default()));
            //let handle = app.handle().clone();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
