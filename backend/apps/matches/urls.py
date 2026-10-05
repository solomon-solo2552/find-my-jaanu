from django.urls import path

from .views import *

app_name = "matches"

urlpatterns = [
    path("matches/", MatchListView.as_view(), name="list"),
    path("matches/likes-received/", WhoLikedMeView.as_view(), name="likes-received"),
    path("matches/likes-sent/", MyLikesView.as_view(), name="likes-sent"),
    path("matches/<uuid:id>/", MatchDetailView.as_view(), name="detail"),
    path("matches/<uuid:match_id>/unmatch/", UnmatchView.as_view(), name="unmatch"),
    path("matches/like/<uuid:profile_id>/", LikeView.as_view(), name="like"),
    path("matches/pass/<uuid:profile_id>/", PassView.as_view(), name="pass"),
]
