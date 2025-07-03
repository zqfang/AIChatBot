# AI ChatBot 

Build with Tauri + React + Vite + Llamaindex

This template provides a minimal setup to get React working in Vite+Tauri.


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