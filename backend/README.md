# AX86 Website Generator API 🚀

**The Billion Dollar Project** - Real GPT-4 integration for AI-powered website generation.

## 🎯 Overview

This is the backend API for AX86's revolutionary AI website generator. Built with **FastAPI + Uvicorn** for maximum performance, it integrates with OpenAI's GPT-4 to create complete, professional HTML websites with Tailwind CSS based on natural language prompts.

## 🚀 Features

- **Real GPT-4 Integration**: Uses OpenAI's most advanced model
- **FastAPI + Uvicorn**: High-performance async Python framework
- **Complete HTML Generation**: Creates full, standalone websites
- **Tailwind CSS**: Modern, responsive styling
- **RESTful API**: Clean, professional API endpoints with automatic documentation
- **Async Support**: Non-blocking I/O for maximum performance
- **Error Handling**: Robust error management and logging
- **CORS Support**: Frontend integration ready
- **Health Monitoring**: Built-in health checks and statistics
- **Interactive Docs**: Automatic OpenAPI/Swagger documentation

## 📋 Requirements

- Python 3.8+
- OpenAI API Key
- Internet connection for API calls

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ax86_landing/backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   export OPENAI_API_KEY="your-openai-api-key-here"
   export GPT_MODEL="gpt-4"  # optional
   export MAX_TOKENS="4000"  # optional
   export TEMPERATURE="0.7"  # optional
   ```

4. **Run the application with Uvicorn**
   ```bash
   # Option 1: Using the startup script
   python run.py
   
   # Option 2: Direct Uvicorn command
   uvicorn app:app --host 0.0.0.0 --port 5000 --reload
   
   # Option 3: Using the shell script
   chmod +x start_uvicorn.sh
   ./start_uvicorn.sh
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | - | ✅ Yes |
| `GPT_MODEL` | GPT model to use | `gpt-4` | No |
| `MAX_TOKENS` | Maximum tokens per request | `4000` | No |
| `TEMPERATURE` | Response creativity (0-1) | `0.7` | No |
| `HOST` | Server host | `0.0.0.0` | No |
| `PORT` | Server port | `5000` | No |
| `FLASK_DEBUG` | Debug mode | `True` | No |

## 📡 API Endpoints

### POST /api/generate
Generate a complete HTML website from a text prompt.

**Request:**
```json
{
  "prompt": "Create a modern tech startup landing page"
}
```

**Response:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html>...",
  "metadata": {
    "generated_at": "2025-01-27T10:30:00Z",
    "request_id": "uuid-here",
    "model": "gpt-4",
    "tokens_used": 1500
  }
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T10:30:00Z",
  "service": "AX86 Website Generator API"
}
```

### GET /api/stats
Get API statistics and configuration.

**Response:**
```json
{
  "service": "AX86 Website Generator API",
  "version": "1.0.0",
  "model": "gpt-4",
  "max_tokens": 4000,
  "temperature": 0.7,
  "status": "operational"
}
```

## 🎨 Frontend Integration

Update your frontend JavaScript to call the real API:

```javascript
async function generateWebsite() {
    const prompt = document.getElementById('websitePrompt').value.trim();
    
    if (!prompt) {
        showNotification('Please describe the website you want to create!', 'error');
        return;
    }

    // Show loading state
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('previewArea').classList.add('hidden');

    try {
        const response = await fetch('http://localhost:5000/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt })
        });

        const result = await response.json();

        if (result.success) {
            // Hide loading state
            document.getElementById('loadingState').classList.add('hidden');
            
            // Show preview
            const preview = document.getElementById('websitePreview');
            const previewArea = document.getElementById('previewArea');
            
            // Create blob URL for the generated HTML
            const blob = new Blob([result.html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            preview.src = url;
            
            previewArea.classList.remove('hidden');
            showNotification('Website generated successfully!', 'success');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        document.getElementById('loadingState').classList.add('hidden');
        showNotification('Error generating website: ' + error.message, 'error');
    }
}
```

## 🚀 Production Deployment

### Using Uvicorn with Gunicorn Workers
```bash
# Install gunicorn with uvicorn workers
pip install gunicorn[uvicorn]

# Run with multiple workers
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:5000
```

### Using Uvicorn directly
```bash
# Production mode
uvicorn app:app --host 0.0.0.0 --port 5000 --workers 4
```

### Using Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

# Use Uvicorn for production
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000", "--workers", "4"]
```

## 📊 Monitoring

The API includes built-in monitoring:
- Health check endpoint for load balancers
- Request logging with timestamps
- Error tracking and reporting
- Token usage monitoring

## 🔒 Security

- CORS configuration for frontend integration
- Input validation and sanitization
- Error message sanitization
- Rate limiting ready (can be added)

## 🎯 Future Enhancements

- [ ] Rate limiting
- [ ] Authentication and API keys
- [ ] Database integration for request history
- [ ] Multiple AI model support
- [ ] Custom template system
- [ ] Real-time collaboration
- [ ] Version control for generated websites

## 💰 Business Model

This API powers AX86's billion-dollar AI website generation platform:
- **Freemium**: Basic generation with limits
- **Pro**: Unlimited generation + premium features
- **Enterprise**: Custom models + white-label solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

Proprietary - AX86 AssemblerX86 Technology

---

**Ready to build the future of web development! 🚀**
