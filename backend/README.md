# HermesAI Backend

Django REST Framework backend for HermesAI with OpenAI Vector Store integration.

## Features

- **Vector Store Management**: Create and manage OpenAI vector stores
- **Document Upload**: Upload files and process them through OpenAI
- **Semantic Search**: Search through documents using vector similarity
- **Query History**: Track and manage search queries
- **REST API**: Full REST API for frontend integration

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Configuration**:
   Copy `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   DEBUG=True
   SECRET_KEY=your_secret_key_here
   ```

3. **Database Setup**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create Superuser** (optional):
   ```bash
   python manage.py createsuperuser
   ```

5. **Run Development Server**:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Vector Stores
- `GET /api/vector-stores/` - List all vector stores
- `POST /api/vector-stores/` - Create a new vector store
- `GET /api/vector-stores/{id}/` - Get vector store details
- `PUT /api/vector-stores/{id}/` - Update vector store
- `DELETE /api/vector-stores/{id}/` - Delete vector store
- `POST /api/vector-stores/{id}/search/` - Search in vector store
- `GET /api/vector-stores/{id}/status/` - Get OpenAI status

### Documents
- `GET /api/documents/` - List all documents
- `POST /api/documents/` - Upload a new document
- `GET /api/documents/{id}/` - Get document details
- `PUT /api/documents/{id}/` - Update document
- `DELETE /api/documents/{id}/` - Delete document
- `GET /api/documents/{id}/status/` - Get processing status

### Queries
- `GET /api/queries/` - List query history
- `GET /api/queries/{id}/` - Get query details

## Usage Examples

### Create a Vector Store
```bash
curl -X POST http://localhost:8000/api/vector-stores/ \
  -H "Content-Type: application/json" \
  -d '{"name": "My Documents", "metadata": {"type": "general"}}'
```

### Upload a Document
```bash
curl -X POST http://localhost:8000/api/documents/ \
  -F "title=My Document" \
  -F "file=@document.pdf" \
  -F "vector_store_id=your-vector-store-id"
```

### Search Documents
```bash
curl -X POST http://localhost:8000/api/vector-stores/{id}/search/ \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the main topic?", "max_results": 5}'
```


