"""
AX86 Website Generator - Production Configuration
"""

import os

# Production CORS origins - Add your actual domains here
PRODUCTION_ORIGINS = [
    "https://ax86.tech",
    "https://www.ax86.tech",
    "https://yourdomain.com",  # Replace with your actual domain
    "https://www.yourdomain.com",  # Replace with your actual domain
]

# Development origins
DEVELOPMENT_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "file://",  # For local HTML files
]

def get_allowed_origins():
    """Get allowed origins based on environment"""
    env = os.getenv("ENVIRONMENT", "development")
    
    if env == "production":
        return PRODUCTION_ORIGINS
    else:
        return DEVELOPMENT_ORIGINS

def get_cors_config():
    """Get CORS configuration"""
    return {
        "allow_origins": get_allowed_origins(),
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["*"],
    }
