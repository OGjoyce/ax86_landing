#!/usr/bin/env python3
"""
AX86 AI Website Generator Backend
Real GPT API integration for generating HTML websites
FastAPI + Uvicorn for maximum performance
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
import openai
import os
import json
import logging
from datetime import datetime
import uuid
from typing import Optional, List, Dict
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AX86 Website Generator API",
    description="Real GPT-4 integration for AI-powered website generation - The Billion Dollar Project",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=False,  # Disable credentials to allow wildcard
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add session middleware for conversation history
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "ax86_ai_website_generator_secret_key_2025"))

# OpenAI API configuration
openai.api_key = "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"

# GPT-4 model configuration
GPT_MODEL = "gpt-4"
MAX_TOKENS = 6000  # Increased for more detailed websites
TEMPERATURE = 0.7

# Pydantic models
class GenerateRequest(BaseModel):
    prompt: str
    session_id: Optional[str] = "default"

class GenerateResponse(BaseModel):
    success: bool
    html: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[dict] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str

class StatsResponse(BaseModel):
    service: str
    version: str
    model: str
    max_tokens: int
    temperature: float
    status: str

class WebsiteGenerator:
    def __init__(self):
        # Store conversation history per session
        self.conversation_history: Dict[str, List[Dict[str, str]]] = {}
        
        self.system_prompt = """You are an expert web developer specializing in creating modern, responsive HTML websites using Tailwind CSS and JavaScript.

CRITICAL REQUIREMENTS:
1. Generate ONLY HTML code - no explanations, no markdown, no code blocks
2. Use the NEW Tailwind CSS Play CDN: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
   IMPORTANT: This is the ONLY Tailwind CDN you should use - it's the latest and most reliable
3. You can use images from the internet, but you must credit the source, and you must use the free version of the image.
4. Create a complete, functional website that works standalone
5. Include proper HTML5 structure with head, body, navigation, main content, and footer
6. Make it responsive and mobile-friendly
7. Use modern, professional design patterns with gradients, shadows, and sophisticated layouts
8. Include interactive elements with JavaScript (buttons, hover effects, forms, animations, etc.)
9. Ensure the website is visually appealing and conversion-focused with high-quality design
10. Use proper Tailwind classes for styling (bg-gradient-to-r, shadow-xl, text-4xl, rounded-2xl, etc.)
11. Add professional color schemes, typography, and spacing
12. Include hero sections with background images, feature cards, and call-to-action sections
13. ALWAYS include the Tailwind CDN in the <head> section
14. Use modern Tailwind classes and ensure proper styling
15. Include JavaScript for interactivity when appropriate
16. Make forms functional with JavaScript validation
17. Add smooth animations and transitions
18. Ensure the website works perfectly in an iframe
19. For images and icons, use these WORKING free image sources:
    - Placeholder images: https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Your+Text
    - Unsplash (real working URLs): https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop (coffee)
    - Unsplash (food): https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop (pasta)
    - Unsplash (restaurant): https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop (restaurant)
    - Pexels (real working URLs): https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?w=400&h=300&fit=crop
    - Icons: Use Font Awesome CDN: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    - Or use simple SVG icons directly in HTML
20. Style images with Tailwind classes: w-full, h-64, rounded-lg, object-cover, etc.
21. Use proper alt attributes for accessibility
22. ALWAYS include AX86 branding in the footer: "Powered by AX86 - AI Technology Solutions" with black and gold styling
23. Use AX86 color scheme when appropriate: black (#000000), gold (#D4AF36), and professional styling

RESPONSE FORMAT:
- Start with <!DOCTYPE html>
- End with </html>
- No code blocks or markdown formatting
- No explanations or comments outside the HTML
- Pure HTML with embedded JavaScript in <script> tags
- JavaScript should be in the <head> or before </body>"""

    def generate_website(self, user_prompt, session_id="default"):
        """Generate a complete HTML website based on user prompt with conversation history using new Responses API"""
        try:
            # Initialize conversation history for this session if it doesn't exist
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []
            
            # Get conversation history for this session
            conversation_history = self.conversation_history[session_id]
            
            # Build input array with conversation history
            input_messages = []
            
            # Add system prompt as first message
            input_messages.append({"role": "system", "content": self.system_prompt})
            
            # Add conversation history
            for turn in conversation_history:
                input_messages.append({"role": "user", "content": turn["user_prompt"]})
                input_messages.append({"role": "assistant", "content": turn["ai_response"]})
            
            # Add current user prompt with context awareness
            if len(conversation_history) > 0:
                # Get the last HTML response for modifications
                last_html = conversation_history[-1]["ai_response"] if conversation_history else None
                
                # This is a follow-up request - check if it's asking for modifications
                if any(word in user_prompt.lower() for word in ['change', 'modify', 'update', 'add', 'remove', 'make', 'color', 'style', 'fix']) and last_html:
                    # This is a modification request - send the actual HTML to GPT
                    current_prompt = f"""You are modifying an existing website. The user wants to make specific changes to the current HTML.

CURRENT HTML CODE:
{last_html}

USER REQUEST: {user_prompt}

IMPORTANT: This is a MODIFICATION request. You should:
1. Start from the CURRENT HTML CODE above
2. Apply ONLY the specific changes the user requested
3. Keep everything else exactly the same
4. Maintain the same structure, layout, and styling
5. Only change what the user specifically asked for
6. Return the FULL updated HTML code (no explanations, no markdown)

Requirements:
- Use Tailwind CSS for styling (ALWAYS include <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> in <head>)
- Apply the user's specific changes while keeping everything else identical
- Keep the website professional and visually appealing
- Use proper Tailwind classes for styling
- Include interactive JavaScript elements
- Use real image URLs from free sources (unsplash.com, pexels.com)
- Ensure the website renders properly in an iframe
- ALWAYS include "Powered by AX86 - AI Technology Solutions" in the footer

Return the complete updated HTML code:"""
                else:
                    # This is a new website request in the same conversation
                    current_prompt = f"""You are continuing a conversation about website development. The user is now requesting a new website.

CURRENT USER REQUEST: {user_prompt}

Create a complete, professional website based on this new request.

Requirements:
- Use Tailwind CSS for styling (ALWAYS include <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> in <head>)
- Create a complete, professional website
- Include navigation, hero section, features, and footer
- Make it responsive and mobile-friendly
- Use modern design principles with proper Tailwind classes
- Include interactive JavaScript elements (forms, animations, hover effects, etc.)
- Make forms functional with JavaScript validation
- Add smooth animations and transitions
- Include call-to-action buttons with JavaScript functionality
- Add images and icons using free online sources (unsplash.com, pexels.com)
- Use proper image URLs so we can use the image in the website
- Style images with Tailwind classes (w-full, h-64, rounded-lg, object-cover)
- NEVER use placeholder text like <recipe> - always use actual image URLs
- Ensure it's visually appealing and professional
- Use colors like bg-blue-500, text-white, p-4, rounded-lg, shadow-lg, etc.
- IMPORTANT: The website must render properly in an iframe with full Tailwind CSS styling and JavaScript functionality
- ALWAYS include "Powered by AX86 - AI Technology Solutions" in the footer

Generate the complete HTML code with embedded JavaScript:"""
            else:
                # This is a new website request
                current_prompt = f"""Create an HTML website with the following requirements:

User Request: {user_prompt}
Session ID: {session_id}

Requirements:
- Use Tailwind CSS for styling (ALWAYS include <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> in <head> - This is the NEW Play CDN)
- Create a complete, professional website
- Include navigation, hero section, features, and footer
- Make it responsive and mobile-friendly
- Use modern design principles with proper Tailwind classes
- Include interactive JavaScript elements (forms, animations, hover effects, etc.)
- Make forms functional with JavaScript validation
- Add smooth animations and transitions
- Include call-to-action buttons with JavaScript functionality
- Add images and icons using free online sources (placeholder.com, unsplash.com, pexels.com)
- Use proper image URLs so we can use the image in the website
- Style images with Tailwind classes (w-full, h-64, rounded-lg, object-cover)
- NEVER use placeholder text like <recipe> - always use actual image URLs
- Ensure it's visually appealing and professional
- Use colors like bg-blue-500, text-white, p-4, rounded-lg, shadow-lg, etc.
- IMPORTANT: The website must render properly in an iframe with full Tailwind CSS styling and JavaScript functionality
- ALWAYS include "Powered by AX86 - AI Technology Solutions" in the footer

Generate the complete HTML code with embedded JavaScript:"""
            
            input_messages.append({"role": "user", "content": current_prompt})

            # Call OpenAI using standard Chat Completions API with conversation history
            response = openai.chat.completions.create(
                model=GPT_MODEL,
                messages=input_messages,
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE
            )

            # Extract the generated HTML from standard API
            generated_html = response.choices[0].message.content.strip()
            
            # Clean up the response (remove any markdown formatting)
            if generated_html.startswith('```html'):
                generated_html = generated_html[7:]
            if generated_html.startswith('```'):
                generated_html = generated_html[3:]
            if generated_html.endswith('```'):
                generated_html = generated_html[:-3]
            
            generated_html = generated_html.strip()

            # Validate HTML structure
            if not generated_html.startswith('<!DOCTYPE html>'):
                generated_html = f"<!DOCTYPE html>\n{generated_html}"
            
            if not generated_html.endswith('</html>'):
                generated_html = f"{generated_html}\n</html>"

            # Store conversation history for this session BEFORE returning
            self.conversation_history[session_id].append({
                "user_prompt": user_prompt,
                "ai_response": generated_html,
                "timestamp": datetime.now().isoformat()
            })
            
            # Keep only last 10 conversations to avoid token limits
            if len(self.conversation_history[session_id]) > 10:
                self.conversation_history[session_id] = self.conversation_history[session_id][-10:]

            # Log generation success
            logger.info(f"Generated website for session {session_id} - History Length: {len(conversation_history)}")

            return {
                "success": True,
                "html": generated_html,
                "session_id": session_id,  # Send session ID to frontend
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "request_id": str(uuid.uuid4()),
                    "user_prompt": user_prompt,
                    "model": GPT_MODEL,
                    "tokens_used": 0,  # New Responses API doesn't expose usage in same way
                    "session_id": session_id,
                    "conversation_length": len(self.conversation_history[session_id])
                }
            }

        except Exception as e:
            logger.error(f"Error generating website: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "html": None
            }

# Initialize the website generator
generator = WebsiteGenerator()

@app.get("/", response_class=HTMLResponse)
async def index():
    """Serve the main frontend page"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AX86 Website Generator API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #0D52BA; text-align: center; }
            .api-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .endpoint { margin: 10px 0; padding: 10px; background: #e9ecef; border-radius: 3px; }
            .method { font-weight: bold; color: #28a745; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 AX86 Website Generator API</h1>
            <p style="text-align: center; color: #666;">The Billion Dollar Project - Real GPT-4 Integration</p>
            
            <div class="api-info">
                <h3>📡 Available Endpoints:</h3>
                <div class="endpoint">
                    <span class="method">POST</span> /api/generate - Generate website from prompt
                </div>
                <div class="endpoint">
                    <span class="method">GET</span> /api/health - Health check
                </div>
                <div class="endpoint">
                    <span class="method">GET</span> /api/stats - API statistics
                </div>
                <div class="endpoint">
                    <span class="method">GET</span> /docs - Interactive API documentation
                </div>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
                <a href="/docs" style="background: #0D52BA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    View API Documentation
                </a>
            </p>
        </div>
    </body>
    </html>
    """

@app.post("/api/generate", response_model=GenerateResponse)
async def generate_website(request: GenerateRequest, http_request: Request):
    """API endpoint to generate websites with session management"""
    try:
        user_prompt = request.prompt.strip()
        
        if not user_prompt:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")

        # Get session ID from request body first, then from HTTP session
        session_id = request.session_id
        if not session_id:
            session_id = http_request.session.get("session_id")
        if not session_id:
            session_id = f"user_{int(time.time())}_{uuid.uuid4().hex[:8]}"
            http_request.session["session_id"] = session_id
        
        logger.info(f"Generating website for prompt: {user_prompt[:100]}...")
        logger.info(f"Session ID from request: {request.session_id}")
        logger.info(f"Session ID being used: {session_id}")
        logger.info(f"Conversation History Length: {len(generator.conversation_history.get(session_id, []))}")
        
        # Generate the website with conversation history
        result = generator.generate_website(user_prompt, session_id)
        
        if result['success']:
            logger.info(f"Successfully generated website (ID: {result['metadata']['request_id']})")
            logger.info(f"New Conversation Length: {result['metadata']['conversation_length']}")
            return GenerateResponse(**result)
        else:
            logger.error(f"Failed to generate website: {result['error']}")
            raise HTTPException(status_code=500, detail=result['error'])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/clear-session")
async def clear_session(http_request: Request):
    """Clear conversation history for current session"""
    try:
        session_id = http_request.session.get("session_id")
        if session_id and session_id in generator.conversation_history:
            del generator.conversation_history[session_id]
            logger.info(f"Cleared conversation history for session: {session_id}")
            return {"success": True, "message": "Session cleared successfully"}
        else:
            return {"success": False, "message": "No active session found"}
    except Exception as e:
        logger.error(f"Error clearing session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error clearing session: {str(e)}")

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        service="AX86 Website Generator API"
    )

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get API statistics"""
    return StatsResponse(
        service="AX86 Website Generator API",
        version="1.0.0",
        model=GPT_MODEL,
        max_tokens=MAX_TOKENS,
        temperature=TEMPERATURE,
        status="operational"
    )

if __name__ == '__main__':
    import uvicorn
    
    # Check if OpenAI API key is set
    if not openai.api_key:
        logger.error("OPENAI_API_KEY environment variable is not set!")
        logger.error("Please set your OpenAI API key: export OPENAI_API_KEY='your-api-key-here'")
        exit(1)
    
    logger.info("Starting AX86 Website Generator API with Uvicorn...")
    logger.info(f"Using GPT model: {GPT_MODEL}")
    logger.info("API endpoints available:")
    logger.info("  POST /api/generate - Generate website from prompt")
    logger.info("  GET  /api/health - Health check")
    logger.info("  GET  /api/stats - API statistics")
    logger.info("  GET  /docs - Interactive API documentation")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )
