from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VectorStoreViewSet, DocumentViewSet, QueryViewSet

router = DefaultRouter()
router.register(r'vector-stores', VectorStoreViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'queries', QueryViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]