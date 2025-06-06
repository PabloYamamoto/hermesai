from django.contrib import admin
from .models import VectorStore, Document, Query


@admin.register(VectorStore)
class VectorStoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'openai_vector_store_id', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'openai_vector_store_id']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'vector_store', 'status', 'file_size', 'upload_date']
    list_filter = ['status', 'content_type', 'upload_date', 'vector_store']
    search_fields = ['title', 'openai_file_id']
    readonly_fields = ['id', 'file_size', 'content_type', 'upload_date', 'processed_date', 'openai_file_id', 'openai_vector_store_file_id']


@admin.register(Query)
class QueryAdmin(admin.ModelAdmin):
    list_display = ['query_text_short', 'vector_store', 'created_at', 'max_results']
    list_filter = ['created_at', 'vector_store']
    search_fields = ['query_text']
    readonly_fields = ['id', 'created_at', 'response']

    def query_text_short(self, obj):
        return obj.query_text[:50] + "..." if len(obj.query_text) > 50 else obj.query_text
    query_text_short.short_description = 'Query'
