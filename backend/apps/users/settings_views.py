from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import RefreshToken

from .settings_serializers import (
    ChangeEmailSerializer,
    ChangePasswordSerializer,
    DeleteAccountSerializer,
)
from .serializers import UserSerializer

User = get_user_model()


class ChangeEmailView(APIView):
    """POST /api/auth/change-email/"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangeEmailSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/ — updates password and blacklists all other tokens."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Blacklist all outstanding tokens for this user (forces re-login everywhere else)
        for token in OutstandingToken.objects.filter(user=user):
            BlacklistedToken.objects.get_or_create(token=token)

        return Response(
            {"detail": "Password updated. Please log in again."},
            status=status.HTTP_200_OK,
        )


class LogoutAllView(APIView):
    """POST /api/auth/logout-all/ — blacklist all refresh tokens for this user."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        tokens = OutstandingToken.objects.filter(user=user)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)
        return Response(
            {"detail": f"Logged out from {tokens.count()} session(s)."},
            status=status.HTTP_200_OK,
        )


class DeleteAccountView(APIView):
    """DELETE /api/auth/delete-account/ — permanently deletes the user."""

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        serializer = DeleteAccountSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        # Cascade deletes: profile, photos, likes, matches, messages, blocks, reports
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)