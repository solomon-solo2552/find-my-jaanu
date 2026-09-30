from django.urls import path, include

urlpatterns = [
    path("auth/", include("apps.users.urls")),
    path("", include("apps.profiles.urls")),
    path("", include("apps.matches.urls")),
    path("", include("apps.chat.urls")),
]