from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import VectorStore, Document, Query
from .serializers import (
    VectorStoreSerializer, DocumentSerializer, DocumentUploadSerializer,
    QuerySerializer, VectorStoreSearchSerializer, VectorStoreCreateSerializer
)
# Use alternative service due to OpenAI client issues
from .alternative_service import AlternativeOpenAIService as OpenAIVectorStoreService
USE_ALTERNATIVE_SERVICE = True
print("Using alternative OpenAI service (HTTP-based)")


class VectorStoreViewSet(viewsets.ModelViewSet):
    queryset = VectorStore.objects.all()
    serializer_class = VectorStoreSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return VectorStoreCreateSerializer
        elif self.action == 'search':
            return VectorStoreSearchSerializer
        return VectorStoreSerializer

    def create(self, request):
        """Create a new vector store"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            openai_service = OpenAIVectorStoreService()
            vector_store = openai_service.create_vector_store(
                name=serializer.validated_data['name'],
                metadata=serializer.validated_data.get('metadata', {})
            )
            
            response_serializer = VectorStoreSerializer(vector_store)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating vector store: {str(e)}")  # Add logging
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], serializer_class=VectorStoreSearchSerializer)
    def search(self, request, pk=None):
        """Search in a vector store"""
        print(f"Search request for vector store: {pk}")
        print(f"Search request data: {request.data}")
        
        vector_store = self.get_object()
        print(f"Vector store found: {vector_store.name} (ID: {vector_store.id})")
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"Search serializer errors: {serializer.errors}")
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            openai_service = OpenAIVectorStoreService()
            print(f"Searching with query: '{serializer.validated_data['query']}'")
            
            results = openai_service.search_vector_store(
                vector_store_id=vector_store.openai_vector_store_id,
                query=serializer.validated_data['query'],
                max_results=serializer.validated_data.get('max_results', 10)
            )
            
            print(f"Search completed successfully")
            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Search error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """Get vector store status from OpenAI"""
        vector_store = self.get_object()
        
        try:
            openai_service = OpenAIVectorStoreService()
            status_data = openai_service.get_vector_store_status(vector_store)
            return Response(status_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentUploadSerializer
        return DocumentSerializer

    def create(self, request):
        """Upload and process a document"""
        print(f"Document upload request data: {request.data}")
        print(f"Files in request: {request.FILES}")
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create document instance
            document = serializer.save()
            print(f"Document created: {document.id}")
            
            # Process with OpenAI
            openai_service = OpenAIVectorStoreService()
            processed_document = openai_service.process_document(
                document=document,
                vector_store=document.vector_store
            )
            
            response_serializer = DocumentSerializer(processed_document)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error processing document: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """Get document processing status"""
        document = self.get_object()
        
        try:
            openai_service = OpenAIVectorStoreService()
            status_data = openai_service.get_file_status(document)
            
            # Return updated document data
            serializer = self.get_serializer(document)
            return Response({
                'document': serializer.data,
                'openai_status': status_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_queryset(self):
        """Filter documents by vector store if provided"""
        queryset = Document.objects.all()
        vector_store_id = self.request.query_params.get('vector_store', None)
        if vector_store_id:
            queryset = queryset.filter(vector_store_id=vector_store_id)
        return queryset


class QueryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer

    def get_queryset(self):
        """Filter queries by vector store if provided"""
        queryset = Query.objects.all()
        vector_store_id = self.request.query_params.get('vector_store', None)
        if vector_store_id:
            queryset = queryset.filter(vector_store_id=vector_store_id)
        return queryset
