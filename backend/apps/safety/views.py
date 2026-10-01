from django.db import transaction
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.matches.models import Match
from apps.profiles.models import Profile
from .models import Report, Block
from .serializers import ReportSerializer, BlockSerializer


def get_my_profile(user):
    return Profile.objects.filter(user=user).first()


class ReportView(APIView):
    """POST /api/safety/report/<profile_id>/ — report someone."""

    permission_classes = [IsAuthenticated]

    def post(self, request, profile_id):
        me = get_my_profile(request.user)
        if not me:
            return Response({"detail": "No profile."}, status=400)

        try:
            other = Profile.objects.get(id=profile_id)
        except Profile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=404)

        if other.id == me.id:
            return Response({"detail": "You can't report yourself."}, status=400)

        reason = request.data.get("reason")
        details = (request.data.get("details") or "").strip()

        valid_reasons = [r[0] for r in Report.REASON_CHOICES]
        if reason not in valid_reasons:
            return Response({"detail": "Invalid reason."}, status=400)

        report = Report.objects.create(
            reporter=me,
            reported=other,
            reason=reason,
            details=details[:500],
        )

        return Response(
            ReportSerializer(report).data,
            status=status.HTTP_201_CREATED,
        )


class BlockView(APIView):
    """POST /api/safety/block/<profile_id>/ — block someone.
       DELETE /api/safety/block/<profile_id>/ — unblock someone.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, profile_id):
        # ... (same as before)
        pass

    def delete(self, request, profile_id):
        me = get_my_profile(request.user)
        if not me:
            return Response({"detail": "No profile."}, status=400)

        deleted, _ = Block.objects.filter(blocker=me, blocked_id=profile_id).delete()
        if not deleted:
            return Response({"detail": "Not blocked."}, status=404)

        return Response(status=status.HTTP_204_NO_CONTENT)


class BlockedListView(generics.ListAPIView):
    """GET /api/safety/blocked/ — list everyone I've blocked."""

    serializer_class = BlockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        me = get_my_profile(self.request.user)
        if not me:
            return Block.objects.none()
        return (
            Block.objects.filter(blocker=me)
            .select_related("blocked")
            .prefetch_related("blocked__photos")
            .order_by("-created_at")
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx