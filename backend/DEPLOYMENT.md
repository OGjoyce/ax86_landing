# AX86 Website Generator - Production Deployment Guide

## 🚀 Production Setup

### 1. Environment Variables

Create a `.env` file in the backend directory:

```bash
# OpenAI API Key
OPENAI_API_KEY=your_actual_openai_api_key

# Production CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://ax86.tech,https://www.ax86.tech,https://yourdomain.com

# Strong Session Secret (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
SESSION_SECRET_KEY=your_very_strong_session_secret_key

# Environment
ENVIRONMENT=production

# Server Configuration
HOST=0.0.0.0
PORT=5000
```

### 2. Update CORS Origins

Edit `backend/config_production.py` and update the `PRODUCTION_ORIGINS` list with your actual domains:

```python
PRODUCTION_ORIGINS = [
    "https://ax86.tech",
    "https://www.ax86.tech",
    "https://yourdomain.com",  # Replace with your actual domain
    "https://www.yourdomain.com",  # Replace with your actual domain
]
```

### 3. Security Considerations

#### ✅ What's Production-Ready:
- **CORS Protection**: Only allows specific domains
- **Session Management**: Secure session handling
- **Input Validation**: Pydantic models for request validation
- **Error Handling**: Proper error responses
- **Logging**: Comprehensive logging for monitoring

#### ⚠️ What to Add for Production:
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Add rate limiting to prevent abuse
- **API Key Rotation**: Regular OpenAI API key rotation
- **Monitoring**: Add application monitoring (e.g., Sentry)
- **Load Balancing**: Use a reverse proxy (nginx) for load balancing

### 4. Deployment Options

#### Option A: Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
```

#### Option B: Direct Server Deployment
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your_key"
export ENVIRONMENT="production"
export ALLOWED_ORIGINS="https://ax86.tech,https://www.ax86.tech"

# Run with uvicorn
uvicorn app:app --host 0.0.0.0 --port 5000 --workers 4
```

#### Option C: Cloud Deployment (AWS/GCP/Azure)
- Use managed services like AWS ECS, Google Cloud Run, or Azure Container Instances
- Set environment variables in the cloud platform
- Configure load balancer for HTTPS termination

### 5. Frontend Deployment

Update the frontend to use your production API URL:

```javascript
// In index.html, change:
const response = await fetch('http://localhost:5000/api/generate', fetchOptions);

// To:
const response = await fetch('https://api.ax86.tech/api/generate', fetchOptions);
```

### 6. Monitoring & Maintenance

- **Health Check**: `GET /api/health`
- **Statistics**: `GET /api/stats`
- **Logs**: Monitor application logs for errors
- **Session Cleanup**: Consider implementing session cleanup for inactive users

### 7. Security Checklist

- [ ] HTTPS enabled
- [ ] CORS origins configured correctly
- [ ] Strong session secret key
- [ ] OpenAI API key secured
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] Error messages don't expose sensitive info
- [ ] Logging configured for security events

## 🔧 Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| CORS Origins | `file://`, localhost | Specific domains only |
| Session Management | In-memory | Persistent with secure cookies |
| Error Messages | Detailed | Generic |
| Logging | Debug level | Info/Warning level |
| HTTPS | Optional | Required |
| Rate Limiting | Disabled | Enabled |

## 📞 Support

For production deployment support, contact: admin@ax86.tech
