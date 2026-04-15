"""
Financial Indicators URL Configuration
"""

from django.urls import path
from . import views

urlpatterns = [
    path('calculate/', views.calculate_financial_indicators, name='calculate_financial_indicators'),
    path('calculate-ai/', views.calculate_financial_indicators_ai, name='calculate_financial_indicators_ai'),
]
