#!/usr/bin/env python3
"""
Simple test script to verify the Threadist backend API
Run this after starting the backend server
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("   Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_reddit_search():
    """Test Reddit search endpoint"""
    print("\n🔍 Testing Reddit search...")
    try:
        response = requests.get(f"{BASE_URL}/api/reddit/search", params={
            "query": "story",
            "limit": 5
        })
        if response.status_code == 200:
            stories = response.json()
            print(f"✅ Reddit search passed - Found {len(stories)} stories")
            if stories:
                print(f"   First story: {stories[0]['title'][:50]}...")
            return True
        else:
            print(f"❌ Reddit search failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Reddit search error: {e}")
        return False

def test_trending_stories():
    """Test trending stories endpoint"""
    print("\n🔍 Testing trending stories...")
    try:
        response = requests.get(f"{BASE_URL}/api/recommendations/trending", params={
            "limit": 5
        })
        if response.status_code == 200:
            recommendations = response.json()
            print(f"✅ Trending stories passed - Found {len(recommendations)} recommendations")
            if recommendations:
                print(f"   First recommendation: {recommendations[0]['post']['title'][:50]}...")
            return True
        else:
            print(f"❌ Trending stories failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Trending stories error: {e}")
        return False

def test_tts_generate():
    """Test TTS generation endpoint"""
    print("\n🔍 Testing TTS generation...")
    try:
        test_text = "This is a test story for audio generation."
        response = requests.post(f"{BASE_URL}/api/tts/generate", params={
            "text": test_text
        })
        if response.status_code == 200:
            result = response.json()
            print("✅ TTS generation passed")
            print(f"   Audio URL: {result['audio_url']}")
            print(f"   Text length: {result['text_length']}")
            return True
        else:
            print(f"❌ TTS generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ TTS generation error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Threadist Backend API Test")
    print("=" * 40)
    
    tests = [
        test_health_check,
        test_reddit_search,
        test_trending_stories,
        test_tts_generate,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check your environment variables and API keys.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 