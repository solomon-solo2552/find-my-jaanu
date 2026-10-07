from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from .settings_views import *

from .views import RegisterView, MeView, LogoutView

app_name = "users"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("me/", MeView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("change-email/", ChangeEmailView.as_view(), name="change-email"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("logout-all/", LogoutAllView.as_view(), name="logout-all"),
    path("delete-account/", DeleteAccountView.as_view(), name="delete-account"),
]