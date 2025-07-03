# AI ChatBot 

Build with Tauri + React + Vite + Llamaindex

This template provides a minimal setup to get React working in a Vite + Tauri app with a Rust backend. It also demonstrates how to integrate Llamaindex for AI-powered chat functionality.

✅ Why not just run LlamaIndex in the browser?

🚫 Bad idea for production !

* Your OpenAI keys would be exposed.
* Embedding big data can be huge in the client (browser).


✅ Why Rust backend in production ?

* Handling local files or private data
* Storing vector embeddings
* Using large models without blowing up the browser’s memory
* Leverage Rust's zero-cost abstractions and memory safety for high-performance LLM operations.


## Demo

![chatbot](./output.gif)

## Get your OPEN_API_KEY

This app requires the `OPENAI_API_KEY` environment variable to be set.

```bash
export OPENAI_API_KEY='sk-'
```


## Dev & Build

Install `nodejs`, `rust` first.

```bash
cd AIChatBot
# install dependencies
pnpm install 
# dev
pnpm tauri dev

# Build
pnpm tauri build
```