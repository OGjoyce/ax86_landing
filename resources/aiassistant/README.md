# AX86 Llama Training Agent

This is the AI assistant service that provides trained responses about AX86 technology, MCP tools, and enterprise solutions.

## Features

- **Trained AI Assistant**: Uses LlamaIndex to provide intelligent responses based on AX86 documentation
- **Document Processing**: Supports PDF, text, and image files for training
- **Web Interface**: Clean chat interface accessible via web browser
- **Session Management**: Maintains conversation history per user
- **File Upload**: Users can upload documents for analysis

## Quick Start

### Windows
```bash
# Double-click to run
start_llama_agent.bat
```

### Manual Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Set API key
set OPENAI_API_KEY=your_api_key_here

# Start the service
uvicorn llama_train_agent:app --host 0.0.0.0 --port 6969 --reload
```

## Access

- **Local**: http://localhost:6969
- **Network**: http://your-ip:6969

## Training Data

The agent is trained on documents in the `train_folder/` directory:
- `AX86_AI_Technology_Sales_Guide.txt` - Main sales documentation
- Additional PDFs, images, and text files

## Integration

This service is integrated with the main AX86 landing page:
- Floating chat button opens this AI assistant
- Provides expert answers about AX86 technology
- Helps with sales and technical questions

## API Endpoints

- `GET /` - Main chat interface
- `POST /chat` - Send message to AI assistant
- `GET /health` - Health check

## Production Deployment

For production, update the port and host settings in `llama_train_agent.py`:

```python
uvicorn.run(app, host="0.0.0.0", port=6969)
```

## Troubleshooting

1. **Port already in use**: Change port in the startup command
2. **Missing dependencies**: Run `pip install -r requirements.txt`
3. **API key issues**: Ensure OPENAI_API_KEY is set correctly
4. **Document loading**: Check that `train_folder/` contains training documents
