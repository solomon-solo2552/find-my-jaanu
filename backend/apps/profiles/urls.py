from django.urls import path

from .views import *

app_name = "profiles"

urlpatterns = [
    path("profiles/", ProfileBrowseView.as_view(), name="browse"),
    path("profiles/discover/", DiscoverView.as_view(), name="discover"),
    path("profiles/me/", MyProfileView.as_view(), name="me"),
    path("profiles/me/photos/", MyPhotoListCreateView.as_view(), name="my-photos"),
    path("profiles/me/photos/<uuid:id>/", MyPhotoDeleteView.as_view(), name="my-photo-detail"),
    path("profiles/public-preview/", PublicStatsView.as_view(), name="public-preview"),
    path("profiles/<uuid:id>/", ProfileDetailView.as_view(), name="detail"),
    path("interests/", InterestListView.as_view(), name="interests"),
]