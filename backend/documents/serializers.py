from rest_framework import serializers
from .models import VectorStore, Document, Query


class VectorStoreSerializer(serializers.ModelSerializer):
    document_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VectorStore
        fields = ['id', 'name', 'created_at', 'updated_at', 'status', 'metadata', 'document_count']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_document_count(self, obj):
        return obj.documents.count()


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file', 'file_size', 'content_type', 'status',
            'upload_date', 'processed_date', 'attributes', 'error_message',
            'vector_store'
        ]
        read_only_fields = [
            'id', 'file_size', 'content_type', 'status', 'upload_date', 
            'processed_date', 'error_message'
        ]


class DocumentUploadSerializer(serializers.ModelSerializer):
    vector_store_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Document
        fields = ['title', 'file', 'vector_store_id', 'attributes']

    def create(self, validated_data):
        vector_store_id = validated_data.pop('vector_store_id')
        vector_store = VectorStore.objects.get(id=vector_store_id)
        
        # Extract file metadata
        file = validated_data['file']
        validated_data['file_size'] = file.size
        validated_data['content_type'] = file.content_type
        validated_data['vector_store'] = vector_store
        
        return super().create(validated_data)


class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = ['id', 'vector_store', 'query_text', 'created_at', 'response', 'max_results']
        read_only_fields = ['id', 'created_at', 'response']


class VectorStoreSearchSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=1000)
    max_results = serializers.IntegerField(min_value=1, max_value=50, default=10)


class VectorStoreCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VectorStore
        fields = ['name', 'metadata']