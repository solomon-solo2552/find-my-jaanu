from django.urls import path

from .views import MessageHistoryView, MatchInfoView

app_name = "chat"

urlpatterns = [
    path("chat/<uuid:match_id>/messages/", MessageHistoryView.as_view(), name="messages"),
    path("chat/<uuid:match_id>/info/", MatchInfoView.as_view(), name="info"),
]