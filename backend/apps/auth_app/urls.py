from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('inscription/', views.inscription, name='inscription'),
    path('connexion/', views.connexion, name='connexion'),
    path('profil/', views.profil, name='profil'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
