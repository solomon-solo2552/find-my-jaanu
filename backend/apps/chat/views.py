import requests as http_requests
from decouple import config
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
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
                "is_featured": other.is_featured,
                "featured_note": other.featured_note,
            },
        })



class SendMessageView(APIView):
    """POST /api/chat/<match_id>/send/ - send a text or image message via REST."""

    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

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
            return Response({"detail": "Match not found or inactive."}, status=404)

        # Extra check: any block between the two parties?
        from apps.safety.models import Block
        other = match.get_other_profile(me)
        if Block.objects.filter(
            Q(blocker=me, blocked=other) | Q(blocker=other, blocked=me)
        ).exists():
            return Response({"detail": "You can't message this user."}, status=403)

        # ---------- Text message ----------
        content = (request.data.get("content") or "").strip()
        image = request.FILES.get("image")
        gif_url = (request.data.get("gif_url") or "").strip()

        # Determine message type
        if image:
            message_type = "image"
        elif gif_url:
            message_type = "image"   # GIF's are images too
        else:
            message_type = "text"

        # validate content
        if message_type == "text":
            if not content:
                return Response({"detail": "Empty message."}, status=400)
            if len(content) > 2000:
                return Response({"detail": "Message too long."}, status=400)
        elif image:
            # Validate file size (10MB)
            if image.size > 10 * 1024 * 1024:
                return Response({"detail": "Image must be under 10MB."}, status=400)

        # Create the message
        message = Message.objects.create(
            match=match,
            sender=me,
            content=content or ("📷 Photo" if image else "🎬 GIF"),
            message_type=message_type,
            is_read=False,
        )

        # Attach image if present
        if image:
            message.image = image
            message.save(update_fields=["image"])
        elif gif_url:
            # Store GIF URL in a dedicated field or reuse content
            message.image_url = gif_url
            message.save(update_fields=["image_url"])

        return Response(
            MessageSerializer(message, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

class GifSearchView(APIView):
    """GET /api/chat/gifs/search/?q=<query> - proxy to Giphy (hides API key)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        api_key = config("GIPHY_API_KEY", default="")

        if not api_key:
            return Response(
                {"detail": "GIF search is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not query:
            # Return trending if no query
            url = "https://api.giphy.com/v1/gifs/trending"
            params = {"api_key": api_key, "limit": 24, "rating": "pg-13"}
        else:
            url = "https://api.giphy.com/v1/gifs/search"
            params = {
                "api_key": api_key,
                "q": query,
                "limit": 24,
                "rating": "pd-13",
            }

        try:
            r = http_requests.get(url, params=params, timeout=5)
            r.raise_for_status()
        except Exception as e:
            return Response(
                {"detail": f"Giphy error: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        data = r.json().get("data", [])
        results = [
            {
                "id": g["id"],
                "url": g["images"]["fixed_height"]["url"],
                "preview": g["images"]["fixed_height_small"]["url"],
                "width": int(g["images"]["fixed_height"]["width"]),
                "height": int(g["images"]["fixed_height"]["height"]),
            }
            for g in data
        ]
        return Response({"results": results})