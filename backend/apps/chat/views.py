from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone

from apps.matches.models import Match
from apps.profiles.models import Profile
from .models import Message
from .serializers import MessageSerializer


def get_my_profile(user):
    return Profile.objects.filter(user=user).first()


class MessageHistoryView(generics.ListAPIView):
    """GET /api/chat/<match_id>/messages/ - paginated chat history."""

    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        me = get_my_profile(self.request.user)
        if not me:
            return Message.objects.none()

        match_id = self.kwargs["match_id"]
        # Ensure the requester is part of this match
        match = Match.objects.filter(
            Q(profile_a=me) | Q(profile_b=me),
            id=match_id,
        ).first()

        if not match:
            return Message.objects.none()

        # Mark incoming unread messages as read (messages not sent by me)
        Message.objects.filter(match=match, is_read=False).exclude(sender=me).update(
            is_read=True, read_at=timezone.now()
        )

        return Message.objects.filter(match=match).select_related("sender").order_by("created_at")

class MatchInfoView(APIView):
    """GET /api/chat/<match_id>/info/ — get the other profile for chat header."""

    permission_classes = [IsAuthenticated]

    def get(self, request, match_id):
        me = get_my_profile(request.user)
        if not me:
            return Response({"detail": "No profile."}, status=400)

        match = Match.objects.filter(
            Q(profile_a=me) | Q(profile_b=me),
            id=match_id,
            is_active=True,
        ).select_related(
            "profile_a__user", "profile_b__user"
        ).prefetch_related(
            "profile_a__photos", "profile_b__photos"
        ).first()

        if not match:
            return Response({"detail": "Match not found."}, status=404)

        other = match.get_other_profile(me)
        primary = other.photos.filter(is_primary=True).first() or other.photos.first()

        # ⚠️ Return ABSOLUTE URL by passing `request` in context
        photo_url = None
        if primary:
            photo_url = request.build_absolute_uri(primary.image.url)

        return Response({
            "match_id": str(match.id),
            "other_profile": {
                "id": str(other.id),
                "display_name": other.display_name,
                "photo": photo_url,
            },
        })



class SendMessageView(APIView):
    """POST /api/chat/<match_id>/send/ — send a message via REST."""

    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        me = get_my_profile(request.user)
        if not me:
            return Response({"detail": "No profile."}, status=400)

        match = Match.objects.filter(
            Q(profile_a=me) | Q(profile_b=me),
            id=match_id,
            is_active=True,
        ).first()

        if not match:
            return Response({"detail": "Match not found."}, status=404)

        content = (request.data.get("content") or "").strip()
        if not content:
            return Response({"detail": "Empty message."}, status=400)
        if len(content) > 2000:
            return Response({"detail": "Message too long."}, status=400)

        message = Message.objects.create(
            match=match,
            sender=me,
            content=content,
            message_type="text",
        )

        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )