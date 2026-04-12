from django.urls import path
from . import views

urlpatterns = [
    path('corriger-image/', views.corriger_image, name='corriger_image'),
    path('corriger-texte/', views.corriger_texte, name='corriger_texte'),
    path('saisir-operation/', views.saisir_operation_ai, name='saisir_operation_ai'),
]
