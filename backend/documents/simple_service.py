"""
Simplified OpenAI service for debugging
"""
import os
from openai import OpenAI
from django.conf import settings


def create_simple_client():
    """Create a simple OpenAI client for testing"""
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def test_simple_vector_store():
    """Test creating a vector store with minimal configuration"""
    try:
        client = create_simple_client()
        
        # Create vector store
        vector_store = client.vector_stores.create(name="Test Store")
        print(f"Created vector store: {vector_store.id}")
        
        # Delete vector store
        client.vector_stores.delete(vector_store_id=vector_store.id)
        print("Deleted test vector store")
        
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False


if __name__ == "__main__":
    test_simple_vector_store()