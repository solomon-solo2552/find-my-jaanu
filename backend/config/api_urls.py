from django.urls import path, include

urlpatterns = [
    path("auth/", include("apps.users.urls")),
    # Day 4+: profiles, matches, chat, safety
]