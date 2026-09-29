from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.profiles.models import Profile
from apps.safety.models import Block
from .models import Like, Match, Pass
from .serializers import MatchSerializer


def get_my_profile(user):
    return Profile.objects.filter(user=user).first()


class LikeView(APIView):
    """POST /api/matches/like/<profile_id>/ — like someone, maybe create a match."""

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, profile_id):
        me = get_my_profile(request.user)
        if not me:
            return Response({"detail": "Create a profile first."}, status=400)

        try:
            other = Profile.objects.get(id=profile_id, is_visible=True)
        except Profile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=404)

        if other.id == me.id:
            return Response({"detail": "You can't like yourself."}, status=400)

        # Blocked?
        if Block.objects.filter(blocker=me, blocked=other).exists() or \
           Block.objects.filter(blocker=other, blocked=me).exists():
            return Response({"detail": "Cannot like this profile."}, status=403)

        like, created = Like.objects.get_or_create(
            liker=me,
            likee=other,
            defaults={"is_super_like": request.data.get("is_super_like", False)},
        )

        if not created:
            return Response(
                {"detail": "Already liked.", "matched": False},
                status=status.HTTP_200_OK,
            )

        # Check for mutual like
        mutual = Like.objects.filter(liker=other, likee=me).exists()
        matched = False
        match_data = None

        if mutual:
            # Canonical ordering
            a, b = sorted([me, other], key=lambda p: str(p.id))
            match, _ = Match.objects.get_or_create(profile_a=a, profile_b=b)
            matched = True
            match_data = MatchSerializer(match, context={"me": me, "request": request}).data

        return Response(
            {"matched": matched, "match": match_data},
            status=status.HTTP_201_CREATED,
        )


class PassView(APIView):
    """POST /api/matches/pass/<profile_id>/ — skip someone."""

    permission_classes = [IsAuthenticated]

    def post(self, request, profile_id):
        me = get_my_profile(request.user)
        if not me:
            return Response({"detail": "Create a profile first."}, status=400)

        try:
            other = Profile.objects.get(id=profile_id)
        except Profile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=404)

        Pass.objects.get_or_create(passer=me, passed=other)
        return Response({"detail": "Passed."}, status=status.HTTP_200_OK)


class MatchListView(generics.ListAPIView):
    """GET /api/matches/ — all my active matches."""

    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        me = get_my_profile(self.request.user)
        if not me:
            return Match.objects.none()
        from django.db.models import Q
        return (
            Match.objects.filter(Q(profile_a=me) | Q(profile_b=me), is_active=True)
            .select_related("profile_a__user", "profile_b__user")
            .prefetch_related("profile_a__photos", "profile_b__photos",
                              "profile_a__interests__interest",
                              "profile_b__interests__interest",
                              "messages")
            .order_by("-matched_at")
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["me"] = get_my_profile(self.request.user)
        return ctx


class MatchDetailView(generics.RetrieveAPIView):
    """GET /api/matches/<uuid>/ — a single match with other profile expanded."""

    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        me = get_my_profile(self.request.user)
        if not me:
            return Match.objects.none()
        from django.db.models import Q
        return Match.objects.filter(Q(profile_a=me) | Q(profile_b=me))

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["me"] = get_my_profile(self.request.user)
        return ctx


class UnmatchView(APIView):
    """DELETE /api/matches/<uuid>/ — deactivate a match."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, match_id):
        me = get_my_profile(request.user)
        from django.db.models import Q
        try:
            match = Match.objects.get(
                Q(profile_a=me) | Q(profile_b=me),
                id=match_id,
            )
        except Match.DoesNotExist:
            return Response({"detail": "Match not found."}, status=404)

        match.is_active = False
        match.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)