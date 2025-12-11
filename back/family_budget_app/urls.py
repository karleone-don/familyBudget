from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'families', FamilyViewSet, basename='family')
router.register(r'finance', FinanceViewSet, basename='finance')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'ai', AIAssistantViewSet, basename='ai')

urlpatterns = [
    path('', include(router.urls)),
]