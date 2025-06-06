from django.db import models
from django.contrib.auth.models import User
import uuid


class VectorStore(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    openai_vector_store_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50, default='pending')
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.name} ({self.openai_vector_store_id})"

    class Meta:
        ordering = ['-created_at']


class Document(models.Model):
    STATUS_CHOICES = [
        ('uploading', 'Uploading'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    file_size = models.BigIntegerField(null=True, blank=True)
    content_type = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploading')
    
    # OpenAI related fields
    openai_file_id = models.CharField(max_length=255, blank=True, null=True)
    vector_store = models.ForeignKey(VectorStore, on_delete=models.CASCADE, related_name='documents')
    openai_vector_store_file_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Metadata
    upload_date = models.DateTimeField(auto_now_add=True)
    processed_date = models.DateTimeField(null=True, blank=True)
    attributes = models.JSONField(default=dict, blank=True)
    
    # Error tracking
    error_message = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-upload_date']


class Query(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vector_store = models.ForeignKey(VectorStore, on_delete=models.CASCADE, related_name='queries')
    query_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    response = models.JSONField(default=dict, blank=True)
    max_results = models.IntegerField(default=10)

    def __str__(self):
        return f"Query: {self.query_text[:50]}..."

    class Meta:
        ordering = ['-created_at']
