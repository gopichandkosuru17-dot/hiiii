"""
Simple test script to verify the API is working correctly
"""

import requests
import json
import time

# Test configuration
API_BASE_URL = 'http://localhost:5000'
TEST_ACCOUNT = {
    "username_length": 12,
    "num_posts": 45,
    "num_followers": 234,
    "num_following": 156,
    "account_age_days": 120,
    "has_profile_picture": 1,
    "has_bio": 1,
    "engagement_ratio": 0.192,
    "is_verified": 0
}

def test_api():
    """Test the API endpoints"""
    print("🧪 Testing Fake Account Detector API...")
    print("=" * 50)
    
    # Test health endpoint
    try:
        print("1. Testing health endpoint...")
        response = requests.get(f'{API_BASE_URL}/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health check passed: {data}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Cannot connect to API: {e}")
        print(f"   💡 Make sure to start the backend first: python api.py")
        return False
    
    # Test prediction endpoint
    print("\n2. Testing prediction endpoint...")
    try:
        response = requests.post(
            f'{API_BASE_URL}/predict',
            json=TEST_ACCOUNT,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Prediction successful!")
            print(f"   📊 Result: {'FAKE' if data['is_fake'] else 'REAL'} account")
            print(f"   🎯 Confidence: {data['probability_fake']:.1%} fake, {1-data['probability_fake']:.1%} real")
        else:
            print(f"   ❌ Prediction failed: {response.status_code}")
            print(f"   📝 Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Prediction request failed: {e}")
        return False
    
    # Test model info endpoint
    print("\n3. Testing model info endpoint...")
    try:
        response = requests.get(f'{API_BASE_URL}/model-info', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Model info retrieved")
            print(f"   🤖 Model type: {data.get('model_type', 'Unknown')}")
            print(f"   📋 Features: {len(data.get('features', []))} total")
        else:
            print(f"   ❌ Model info failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Model info request failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API tests completed!")
    print("🌐 Frontend should work at: http://localhost:8000")
    return True

if __name__ == "__main__":
    test_api()


