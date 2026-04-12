from django.urls import path
from . import views

urlpatterns = [
    path('tresorerie/', views.tresorerie, name='tresorerie'),
    path('compte-resultat/', views.compte_resultat, name='compte_resultat'),
    path('bilan/', views.bilan, name='bilan'),
    path('dashboard/', views.dashboard, name='dashboard'),
]
