from django.urls import path

from .views import *
app_name = "chat"

urlpatterns = [
    path("chat/gifs/search/", GifSearchView.as_view(), name="gif-search"),
    path("chat/messages/<uuid:message_id>/for-me/", DeleteMessageForMeView.as_view(), name="delete-for-me"),
    path("chat/messages/<uuid:message_id>/for-everyone/", DeleteMessageForEveryoneView.as_view(), name="delete-for-everyone"),
    path("chat/<uuid:match_id>/messages/", MessageHistoryView.as_view(), name="messages"),
    path("chat/<uuid:match_id>/send/", SendMessageView.as_view(), name="send"),
    path("chat/<uuid:match_id>/info/", MatchInfoView.as_view(), name="info"),
]