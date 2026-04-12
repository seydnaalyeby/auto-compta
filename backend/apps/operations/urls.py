from django.urls import path
from . import views

urlpatterns = [
    path('saisir/', views.saisir_operation, name='saisir_operation'),
    path('', views.liste_operations, name='liste_operations'),
    path('ecritures/', views.liste_ecritures, name='liste_ecritures'),
    path('<int:pk>/supprimer/', views.supprimer_operation, name='supprimer_operation'),
]
