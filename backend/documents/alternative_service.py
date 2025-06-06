"""
Alternative OpenAI service using requests directly
This bypasses potential OpenAI client issues
"""
import requests
import json
from typing import Optional, Dict, Any
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from django.utils import timezone
from .models import VectorStore, Document, Query


class AlternativeOpenAIService:
    """OpenAI service using direct HTTP requests"""
    
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2"
        }
    
    def create_vector_store(self, name: str, metadata: Optional[Dict] = None) -> VectorStore:
        """Create a new vector store via HTTP request"""
        try:
            # Create vector store in OpenAI
            url = f"{self.base_url}/vector_stores"
            data = {
                "name": name,
                "metadata": metadata or {}
            }
            
            response = requests.post(url, headers=self.headers, json=data, timeout=30)
            response.raise_for_status()
            
            openai_vector_store = response.json()
            
            # Save to database
            vector_store = VectorStore.objects.create(
                openai_vector_store_id=openai_vector_store["id"],
                name=name,
                status='completed',
                metadata=metadata or {}
            )
            
            return vector_store
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to create vector store: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to create vector store: {str(e)}")
    
    def upload_file_to_openai(self, file_content: bytes, filename: str) -> str:
        """Upload a file to OpenAI via HTTP request"""
        try:
            url = f"{self.base_url}/files"
            
            files = {
                'file': (filename, file_content, 'application/octet-stream'),
                'purpose': (None, 'assistants')
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }
            
            response = requests.post(url, headers=headers, files=files, timeout=60)
            response.raise_for_status()
            
            file_data = response.json()
            return file_data["id"]
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to upload file to OpenAI: {str(e)}")
    
    def add_file_to_vector_store(self, vector_store_id: str, file_id: str) -> str:
        """Add a file to a vector store via HTTP request"""
        try:
            url = f"{self.base_url}/vector_stores/{vector_store_id}/files"
            data = {"file_id": file_id}
            
            response = requests.post(url, headers=self.headers, json=data, timeout=30)
            response.raise_for_status()
            
            vector_store_file = response.json()
            return vector_store_file["id"]
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to add file to vector store: {str(e)}")
    
    def search_vector_store(self, vector_store_id: str, query: str, max_results: int = 10) -> Dict[str, Any]:
        """Search in a vector store via HTTP request"""
        try:
            url = f"{self.base_url}/vector_stores/{vector_store_id}/search"
            data = {
                "query": query,
                "max_num_results": max_results
            }
            
            response = requests.post(url, headers=self.headers, json=data, timeout=30)
            response.raise_for_status()
            
            search_results = response.json()
            
            # Save query to database
            vector_store = VectorStore.objects.get(openai_vector_store_id=vector_store_id)
            query_obj = Query.objects.create(
                vector_store=vector_store,
                query_text=query,
                response=search_results,
                max_results=max_results
            )
            
            return {
                'query_id': str(query_obj.id),
                'results': search_results
            }
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to search vector store: {str(e)}")
        except VectorStore.DoesNotExist:
            raise Exception("Vector store not found in database")
    
    def get_vector_store_status(self, vector_store: VectorStore) -> Dict[str, Any]:
        """Get the current status of a vector store from OpenAI"""
        try:
            url = f"{self.base_url}/vector_stores/{vector_store.openai_vector_store_id}"
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            openai_vector_store = response.json()
            
            # Update local status
            vector_store.status = openai_vector_store.get('status', 'completed')
            vector_store.save()
            
            return openai_vector_store
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get vector store status: {str(e)}")
    
    def get_file_status(self, document: Document) -> Dict[str, Any]:
        """Get the current status of a file in the vector store"""
        try:
            if not document.openai_vector_store_file_id:
                raise ValueError("Document must have a vector store file ID")
            
            url = f"{self.base_url}/vector_stores/{document.vector_store.openai_vector_store_id}/files/{document.openai_vector_store_file_id}"
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            file_status = response.json()
            
            # Update document status based on OpenAI status
            status_mapping = {
                'in_progress': 'processing',
                'completed': 'completed',
                'failed': 'failed',
                'cancelled': 'failed'
            }
            
            if file_status.get('status') in status_mapping:
                document.status = status_mapping[file_status['status']]
                if file_status.get('status') == 'completed':
                    document.processed_date = timezone.now()
                elif file_status.get('status') in ['failed', 'cancelled'] and file_status.get('last_error'):
                    document.error_message = str(file_status['last_error'])
                document.save()
            
            return file_status
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get file status: {str(e)}")
    
    def process_document(self, document: Document, vector_store: VectorStore) -> Document:
        """Complete process: upload file to OpenAI and add to vector store"""
        try:
            # Read file content
            document.file.seek(0)
            file_content = document.file.read()
            
            # Upload file to OpenAI
            openai_file_id = self.upload_file_to_openai(file_content, document.file.name)
            document.openai_file_id = openai_file_id
            document.status = 'processing'
            document.save()
            
            # Add file to vector store
            vector_store_file_id = self.add_file_to_vector_store(
                vector_store.openai_vector_store_id, 
                openai_file_id
            )
            document.openai_vector_store_file_id = vector_store_file_id
            document.save()
            
            return document
        except Exception as e:
            document.status = 'failed'
            document.error_message = str(e)
            document.save()
            raise e


# Use this service as a fallback
def get_openai_service():
    """Get the appropriate OpenAI service"""
    try:
        from .services import OpenAIVectorStoreService
        return OpenAIVectorStoreService()
    except Exception as e:
        print(f"Using alternative service due to error: {e}")
        return AlternativeOpenAIService()