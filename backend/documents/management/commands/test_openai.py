from django.core.management.base import BaseCommand
from documents.services import test_openai_connection


class Command(BaseCommand):
    help = 'Test OpenAI connection'

    def handle(self, *args, **options):
        try:
            client = test_openai_connection()
            self.stdout.write(
                self.style.SUCCESS('OpenAI connection test successful!')
            )
            
            # Try to create a simple vector store to test the API
            try:
                vector_store = client.vector_stores.create(name="Test Vector Store")
                self.stdout.write(
                    self.style.SUCCESS(f'Vector store created successfully: {vector_store.id}')
                )
                
                # Clean up - delete the test vector store
                client.vector_stores.delete(vector_store_id=vector_store.id)
                self.stdout.write(
                    self.style.SUCCESS('Test vector store cleaned up successfully')
                )
                
            except Exception as api_error:
                self.stdout.write(
                    self.style.ERROR(f'API call failed: {api_error}')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'OpenAI connection test failed: {e}')
            )