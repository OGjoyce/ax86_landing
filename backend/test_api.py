#!/usr/bin/env python3
"""
AX86 Website Generator API - Test Script
Test the API endpoints to ensure everything works correctly
"""

import requests
import json
import time

API_BASE_URL = "http://localhost:5000"

def test_health():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_stats():
    """Test the stats endpoint"""
    print("🔍 Testing stats endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/stats")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stats retrieved: {data['service']} v{data['version']}")
            print(f"   Model: {data['model']}")
            print(f"   Status: {data['status']}")
            return True
        else:
            print(f"❌ Stats failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Stats error: {e}")
        return False

def test_generate():
    """Test the website generation endpoint"""
    print("🔍 Testing website generation...")
    try:
        test_prompt = "Create a simple landing page for a coffee shop"
        
        payload = {
            "prompt": test_prompt
        }
        
        print(f"   Sending prompt: '{test_prompt}'")
        response = requests.post(
            f"{API_BASE_URL}/api/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Website generation successful!")
                print(f"   Request ID: {data['metadata']['request_id']}")
                print(f"   Generated at: {data['metadata']['generated_at']}")
                print(f"   Tokens used: {data['metadata']['tokens_used']}")
                print(f"   HTML length: {len(data['html'])} characters")
                return True
            else:
                print(f"❌ Generation failed: {data['error']}")
                return False
        else:
            print(f"❌ Generation request failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Generation error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 AX86 Website Generator API - Test Suite")
    print("   The Billion Dollar Project")
    print("=" * 50)
    
    # Wait a moment for server to be ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    tests = [
        ("Health Check", test_health),
        ("Stats Endpoint", test_stats),
        ("Website Generation", test_generate)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name}...")
        if test_func():
            passed += 1
        print("-" * 30)
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The API is working correctly.")
        print("💡 Ready to generate billion-dollar websites!")
    else:
        print("⚠️  Some tests failed. Please check the server logs.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
