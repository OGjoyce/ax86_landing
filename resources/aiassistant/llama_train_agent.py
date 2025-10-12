import os
import asyncio
import markdown
import io
import tempfile
import base64
from typing import List, Optional
from fastapi import FastAPI, Form, Request, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
import PyPDF2
import pytesseract
from PIL import Image
import cv2
import numpy as np

# ——— Llama-Index setup ———
# Note: OPENAI_API_KEY should be set via environment variable
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.llms.openai import OpenAI
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core import StorageContext, load_index_from_storage
from llama_index.core.workflow import Context
import uvicorn

# FastAPI app
app = FastAPI()

# Verify OpenAI API key is set
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable is not set!")

# Serve static files (for logo)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Session middleware with a strong secret key
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "thisisstrong12345"))

# Data paths
DATA_DIR = "./train_folder/"
STORAGE_DIR = "storage"

# Load or build the index once at startup
if os.path.exists(STORAGE_DIR) and os.listdir(STORAGE_DIR):
    storage_context = StorageContext.from_defaults(persist_dir=STORAGE_DIR)
    index = load_index_from_storage(storage_context)
else:
    documents = SimpleDirectoryReader(input_dir=DATA_DIR, recursive=True).load_data()
    index = VectorStoreIndex.from_documents(documents)
    index.storage_context.persist(persist_dir=STORAGE_DIR)

# Query engine
query_engine = index.as_query_engine()

def multiply(a: float, b: float) -> float:
    return a * b

async def search_documents(query: str) -> str:
    resp = await query_engine.aquery(query)
    return str(resp)

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file content."""
    try:
        pdf_stream = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_stream)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        return f"Error processing PDF: {str(e)}"

def extract_text_from_image(file_content: bytes) -> str:
    """Extract text from image using OCR."""
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(file_content))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert PIL image to OpenCV format for preprocessing
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Preprocessing for better OCR results
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold to get image with only black and white
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Noise removal
        kernel = np.ones((1, 1), np.uint8)
        opening = cv2.morphologyEx(thresh, cv2.MORPH_OPENING, kernel, iterations=1)
        
        # Convert back to PIL for pytesseract
        processed_image = Image.fromarray(opening)
        
        # Extract text using pytesseract
        text = pytesseract.image_to_string(processed_image, config='--psm 6')
        return text.strip()
    except Exception as e:
        return f"Error processing image: {str(e)}"

async def process_uploaded_file(file: UploadFile) -> str:
    """Process uploaded file and extract text content."""
    try:
        file_content = await file.read()
        filename = file.filename.lower()
        
        if filename.endswith('.pdf'):
            return extract_text_from_pdf(file_content)
        elif filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff')):
            return extract_text_from_image(file_content)
        else:
            return "Unsupported file type. Please upload PDF or image files."
    except Exception as e:
        return f"Error processing file: {str(e)}"

# Agent setup (no global context)
agent = FunctionAgent(
    name="AX86 AI Technology Assistant",
    description="Expert AI assistant for AX86 technology solutions, MCP tools, and enterprise AI integration",
    tools=[multiply, search_documents],
    llm=OpenAI(model="gpt-4o-mini"),
    system_prompt=(
        """You are the AX86 AI Assistant, powered by AssemblerX86 technology. You are an expert in:

Key AX86 Technologies:
- MCP (Model Context Protocol) tools for business integration
- Custom AI assistants for enterprise solutions
- AI-powered website generation and modification
- Enterprise AI integration and automation

Your expertise includes:
- Explaining how MCP tools can transform business operations
- Describing AI assistant capabilities for sales, customer service, and operations
- Providing technical guidance on AI implementation
- Document analysis from PDFs and images using OCR
- Strategic consultation for AI adoption

Brand Identity:
- Professional, high-value technology solutions
- Black and gold color scheme (AX86 branding)
- Focus on enterprise and medium-to-large businesses
- Emphasis on response time improvement and automation

If someone asks for human assistance or wants to discuss custom solutions, provide Carlos's contact: https://wa.me/50259307820 or email admin@ax86.tech

Always maintain the professional, technology-focused tone that reflects AX86's premium positioning in the AI solutions market."""
    ),
)

# Render conversation history to HTML
def render_conversation(history: list[dict]) -> str:
    html = ""
    for turn in history:
        user_q = turn["query"]
        ai_md = turn["response"]
        ai_html = markdown.markdown(
            ai_md,
            extensions=["fenced_code", "tables", "nl2br"]
        )
        html += f"""
        <div class=\"turn mb-6\">
          <div class=\"max-w-3xl mx-auto bg-gray-50 p-4 rounded-lg shadow-sm border-l-4 border-yellow-400\">
            <span class=\"font-semibold text-black\">You</span>
            <p class=\"mt-1 text-gray-700\">{user_q}</p>
          </div>
          <div class=\"max-w-3xl mx-auto mt-2 bg-white p-4 rounded-lg shadow-sm border-l-4 border-black\">
            <span class=\"font-semibold text-black\">AX86 AI Assistant</span>
            <div class=\"mt-1 prose prose-sm text-gray-700 prose-headings:text-black prose-a:text-yellow-600 prose-strong:text-black\">
              {ai_html}
            </div>
          </div>
        </div>
        """
    return html

# GET endpoint
@app.get("/", response_class=HTMLResponse)
async def get_chat(request: Request):
    history = request.session.get("history", [])
    html_content = f"""
    <!DOCTYPE html>
    <html lang=\"en\">
    <head>
      <meta charset=\"UTF-8\" />
      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>
      <script src=\"https://cdn.tailwindcss.com\"></script>
      <title>AX86 AI Assistant</title>
    </head>
    <body class=\"bg-white text-gray-800\">
      <div class=\"flex flex-col h-screen\">

        <header class=\"bg-white border-b-4 border-yellow-400 flex items-center px-6 py-4 shadow-sm\">
          <img src=\"/static/ax86_logo.png\" alt=\"AX86 Logo\" class=\"h-16 w-auto mr-6\"/>
          <div class=\"flex-1\">
            <h1 class=\"text-3xl font-bold text-black\">AX86 AI Assistant</h1>
            <p class=\"text-sm text-gray-600\">Powered by AssemblerX86 Technology</p>
          </div>
        </header>

        <main id=\"chat-container\" class=\"flex-1 overflow-y-auto px-6 py-8 space-y-4\">
          {render_conversation(history)}
        </main>

        <footer class=\"bg-gray-50 px-6 py-4 border-t border-gray-200\">
          <!-- File Upload Area -->
          <div id=\"file-upload-area\" class=\"mb-4 p-4 border-2 border-dashed border-yellow-400 rounded-lg text-center bg-yellow-50 hidden\">
            <div id=\"drop-zone\" class=\"cursor-pointer\">
              <svg class=\"mx-auto h-12 w-12 text-yellow-500\" stroke=\"currentColor\" fill=\"none\" viewBox=\"0 0 48 48\">
                <path d=\"M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" />
              </svg>
              <p class=\"mt-2 text-sm text-yellow-700\">
                <span class=\"font-medium\">Click to upload</span> or drag and drop files here
              </p>
              <p class=\"text-xs text-gray-600\">PDF, PNG, JPG, JPEG, GIF, BMP, TIFF (MAX. 10MB)</p>
            </div>
            <input type=\"file\" id=\"file-input\" class=\"hidden\" accept=\".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff\" multiple />
          </div>
          
          <!-- Selected Files Display -->
          <div id=\"selected-files\" class=\"mb-2\"></div>
          
          <form id=\"chat-form\" action=\"\" method=\"post\" enctype=\"multipart/form-data\" class=\"flex items-center space-x-3\">
            <input
              type=\"text\"
              name=\"query\"
              placeholder=\"Ask about AX86 technology, MCP tools, or AI assistants...\"
              required
              class=\"flex-grow px-4 py-3 bg-white border-2 border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition\"
            />
            <button
              type=\"button\"
              id=\"file-btn\"
              class=\"px-4 py-3 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-500 transition shadow-sm\"
              title=\"Attach files\"
            >
              📎
            </button>
            <button
              type=\"submit\"
              id=\"submit-btn\"
              class=\"px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition shadow-sm\"
            >
              Send
            </button>
            <svg
              id=\"loading-spinner\"
              class=\"hidden animate-spin h-6 w-6 text-yellow-400\"
              xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\"
            >
              <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"/>
              <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8v8z\"/>
            </svg>
          </form>
        </footer>
      </div>

      <script>
        document.addEventListener('DOMContentLoaded', () => {{
          const form = document.getElementById('chat-form');
          const submitBtn = document.getElementById('submit-btn');
          const spinner = document.getElementById('loading-spinner');
          const fileBtn = document.getElementById('file-btn');
          const fileInput = document.getElementById('file-input');
          const fileUploadArea = document.getElementById('file-upload-area');
          const dropZone = document.getElementById('drop-zone');
          const selectedFilesDiv = document.getElementById('selected-files');
          const chatContainer = document.getElementById('chat-container');
          
          let selectedFiles = [];
          
          // Auto-scroll function
          function scrollToBottom() {{
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }}
          
          // Scroll to bottom on page load if there's conversation history
          setTimeout(scrollToBottom, 100);
          
          // File button click
          fileBtn.addEventListener('click', () => {{
            fileUploadArea.classList.toggle('hidden');
          }});
          
          // Drop zone click
          dropZone.addEventListener('click', () => {{
            fileInput.click();
          }});
          
          // File input change
          fileInput.addEventListener('change', (e) => {{
            handleFiles(e.target.files);
          }});
          
          // Drag and drop functionality
          dropZone.addEventListener('dragover', (e) => {{
            e.preventDefault();
            dropZone.classList.add('bg-blue-100');
          }});
          
          dropZone.addEventListener('dragleave', (e) => {{
            e.preventDefault();
            dropZone.classList.remove('bg-blue-100');
          }});
          
          dropZone.addEventListener('drop', (e) => {{
            e.preventDefault();
            dropZone.classList.remove('bg-blue-100');
            handleFiles(e.dataTransfer.files);
          }});
          
          function handleFiles(files) {{
            selectedFiles = Array.from(files);
            displaySelectedFiles();
          }}
          
          function displaySelectedFiles() {{
            selectedFilesDiv.innerHTML = '';
            if (selectedFiles.length > 0) {{
              const filesContainer = document.createElement('div');
              filesContainer.className = 'flex flex-wrap gap-2 mb-2';
              
              selectedFiles.forEach((file, index) => {{
                const fileTag = document.createElement('div');
                fileTag.className = 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center';
                fileTag.innerHTML = `
                  <span class="mr-2">${{file.name}}</span>
                  <button type="button" class="text-blue-600 hover:text-blue-800" onclick="removeFile(${{index}})">×</button>
                `;
                filesContainer.appendChild(fileTag);
              }});
              
              selectedFilesDiv.appendChild(filesContainer);
            }}
          }}
          
          window.removeFile = function(index) {{
            selectedFiles.splice(index, 1);
            displaySelectedFiles();
          }}
          
          // Form submission
          form.addEventListener('submit', async (e) => {{
            e.preventDefault();
            
            submitBtn.disabled = true;
            spinner.classList.remove('hidden');
            
            const formData = new FormData();
            const queryInput = form.querySelector('input[name="query"]');
            formData.append('query', queryInput.value);
            
            // Add selected files
            selectedFiles.forEach((file, index) => {{
              formData.append('files', file);
            }});
            
            try {{
              const response = await fetch('/ai-assistant/', {{
                method: 'POST',
                body: formData
              }});
              
              if (response.ok) {{
                const html = await response.text();
                document.open();
                document.write(html);
                document.close();
                
                // Auto-scroll to bottom after successful response
                setTimeout(() => {{
                  const newChatContainer = document.getElementById('chat-container');
                  if (newChatContainer) {{
                    newChatContainer.scrollTop = newChatContainer.scrollHeight;
                  }}
                }}, 100);
              }}
            }} catch (error) {{
              console.error('Error:', error);
            }} finally {{
              submitBtn.disabled = false;
              spinner.classList.add('hidden');
            }}
          }});
        }});
      </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

# POST endpoint
@app.post("/", response_class=HTMLResponse)
async def chat(request: Request, query: str = Form(...), files: List[UploadFile] = File(default=[])):
    # Process uploaded files
    file_contents = []
    if files and files[0].filename:  # Check if files were actually uploaded
        for file in files:
            if file.size > 10 * 1024 * 1024:  # 10MB limit
                file_contents.append(f"File {file.filename} is too large (max 10MB)")
                continue
                
            extracted_text = await process_uploaded_file(file)
            if extracted_text:
                file_contents.append(f"Content from {file.filename}:\n{extracted_text}")
    
    # Combine query with file contents
    full_query = query
    if file_contents:
        full_query += "\n\nUploaded file contents:\n" + "\n\n".join(file_contents)
    
    # Create a fresh context for each request to isolate users
    ctx = Context(agent)
    raw_output = await agent.run(full_query, ctx=ctx)
    response_str = str(raw_output)

    history = request.session.get("history", [])
    # Store original query for display, but include file info if files were uploaded
    display_query = query
    if file_contents:
        file_names = [f.filename for f in files if f.filename]
        display_query += f" [📎 {len(file_names)} file(s): {', '.join(file_names)}]"
    
    history.append({"query": display_query, "response": response_str})
    request.session["history"] = history

    return await get_chat(request)

# Run the app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6969)