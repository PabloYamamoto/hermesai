import os
from typing import Optional, List, Dict, Any
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from django.utils import timezone
from .models import VectorStore, Document, Query

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError as e:
    print(f"OpenAI import error: {e}")
    OPENAI_AVAILABLE = False


def create_safe_openai_client():
    """Create OpenAI client with safe initialization"""
    if not OPENAI_AVAILABLE:
        raise ValueError("OpenAI package not available")
    
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not configured")
    
    try:
        print(f"Creating OpenAI client...")
        print(f"API Key present: {bool(settings.OPENAI_API_KEY)}")
        
        # Clear proxy environment variables that might interfere
        proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']
        for var in proxy_vars:
            if var in os.environ:
                print(f"Temporarily removing {var}")
                del os.environ[var]
        
        # Initialize with only the required parameter
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        print("OpenAI client created successfully")
        return client
        
    except Exception as e:
        print(f"Failed to create OpenAI client: {type(e).__name__}: {e}")
        raise ValueError(f"Could not initialize OpenAI client: {e}")


def test_openai_connection():
    """Test function to debug OpenAI client initialization"""
    return create_safe_openai_client()


class OpenAIVectorStoreService:
    def __init__(self):
        try:
            self.client = create_safe_openai_client()
        except Exception as e:
            print(f"Error in OpenAIVectorStoreService init: {e}")
            raise e

    def create_vector_store(self, name: str, metadata: Optional[Dict] = None) -> VectorStore:
        """Create a new vector store in OpenAI and save it to database"""
        try:
            # Create vector store in OpenAI
            openai_vector_store = self.client.vector_stores.create(
                name=name,
                metadata=metadata or {}
            )
            
            # Save to database
            vector_store = VectorStore.objects.create(
                openai_vector_store_id=openai_vector_store.id,
                name=name,
                status='completed',
                metadata=metadata or {}
            )
            
            return vector_store
        except Exception as e:
            raise Exception(f"Failed to create vector store: {str(e)}")

    def upload_file_to_openai(self, file: UploadedFile) -> str:
        """Upload a file to OpenAI and return the file ID"""
        try:
            # Create a temporary file-like object for OpenAI
            file.seek(0)  # Reset file pointer
            
            openai_file = self.client.files.create(
                file=(file.name, file.read(), file.content_type),
                purpose="assistants"
            )
            
            return openai_file.id
        except Exception as e:
            raise Exception(f"Failed to upload file to OpenAI: {str(e)}")

    def add_file_to_vector_store(self, vector_store: VectorStore, document: Document) -> str:
        """Add a file to an existing vector store"""
        try:
            if not document.openai_file_id:
                raise ValueError("Document must have an OpenAI file ID")
            
            # Add file to vector store
            vector_store_file = self.client.vector_stores.files.create(
                vector_store_id=vector_store.openai_vector_store_id,
                file_id=document.openai_file_id
            )
            
            # Update document with vector store file ID
            document.openai_vector_store_file_id = vector_store_file.id
            document.status = 'processing'
            document.save()
            
            return vector_store_file.id
        except Exception as e:
            raise Exception(f"Failed to add file to vector store: {str(e)}")

    def search_vector_store(self, vector_store: VectorStore, query: str, max_results: int = 10) -> Dict[str, Any]:
        """Search in a vector store"""
        try:
            search_results = self.client.vector_stores.search(
                vector_store_id=vector_store.openai_vector_store_id,
                query=query,
                max_num_results=max_results
            )
            
            # Save query to database
            query_obj = Query.objects.create(
                vector_store=vector_store,
                query_text=query,
                response=search_results.model_dump(),
                max_results=max_results
            )
            
            return {
                'query_id': str(query_obj.id),
                'results': search_results.model_dump()
            }
        except Exception as e:
            raise Exception(f"Failed to search vector store: {str(e)}")

    def get_vector_store_status(self, vector_store: VectorStore) -> Dict[str, Any]:
        """Get the current status of a vector store from OpenAI"""
        try:
            openai_vector_store = self.client.vector_stores.retrieve(
                vector_store_id=vector_store.openai_vector_store_id
            )
            
            # Update local status
            vector_store.status = openai_vector_store.status
            vector_store.save()
            
            return openai_vector_store.model_dump()
        except Exception as e:
            raise Exception(f"Failed to get vector store status: {str(e)}")

    def get_file_status(self, document: Document) -> Dict[str, Any]:
        """Get the current status of a file in the vector store"""
        try:
            if not document.openai_vector_store_file_id:
                raise ValueError("Document must have a vector store file ID")
            
            file_status = self.client.vector_stores.files.retrieve(
                vector_store_id=document.vector_store.openai_vector_store_id,
                file_id=document.openai_vector_store_file_id
            )
            
            # Update document status based on OpenAI status
            status_mapping = {
                'in_progress': 'processing',
                'completed': 'completed',
                'failed': 'failed',
                'cancelled': 'failed'
            }
            
            if file_status.status in status_mapping:
                document.status = status_mapping[file_status.status]
                if file_status.status == 'completed':
                    document.processed_date = timezone.now()
                elif file_status.status in ['failed', 'cancelled'] and file_status.last_error:
                    document.error_message = str(file_status.last_error)
                document.save()
            
            return file_status.model_dump()
        except Exception as e:
            raise Exception(f"Failed to get file status: {str(e)}")

    def delete_vector_store(self, vector_store: VectorStore) -> bool:
        """Delete a vector store from OpenAI"""
        try:
            self.client.vector_stores.delete(
                vector_store_id=vector_store.openai_vector_store_id
            )
            
            # Delete from database
            vector_store.delete()
            return True
        except Exception as e:
            raise Exception(f"Failed to delete vector store: {str(e)}")

    def process_document(self, document: Document, vector_store: VectorStore) -> Document:
        """Complete process: upload file to OpenAI and add to vector store"""
        try:
            # Upload file to OpenAI
            openai_file_id = self.upload_file_to_openai(document.file)
            document.openai_file_id = openai_file_id
            document.status = 'processing'
            document.save()
            
            # Add file to vector store
            self.add_file_to_vector_store(vector_store, document)
            
            return document
        except Exception as e:
            document.status = 'failed'
            document.error_message = str(e)
            document.save()
            raise e