from django.urls import path

from .views import *

app_name = "safety"

urlpatterns = [
    path("safety/report/<uuid:profile_id>/", ReportView.as_view(), name="report"),
    path("safety/block/<uuid:profile_id>/", BlockView.as_view(), name="block-unblock"),
    path("safety/blocked/", BlockedListView.as_view(), name="blocked-list"),
]