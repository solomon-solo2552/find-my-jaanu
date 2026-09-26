from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile, Interest, Photo
from .serializers import (
    ProfileReadSerializer,
    ProfileWriteSerializer,
    InterestSerializer,
    PhotoSerializer,
)


class MyProfileView(APIView):
    """GET/PUT/PATCH /api/profiles/me/ — view or update your own profile."""

    permission_classes = [IsAuthenticated]

    def get_object(self, user):
        return Profile.objects.filter(user=user).first()

    def get(self, request):
        profile = self.get_object(request.user)
        if not profile:
            return Response(
                {"detail": "You haven't created a profile yet."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ProfileReadSerializer(profile).data)

    def post(self, request):
        """Create profile if it doesn't exist (onboarding)."""
        if self.get_object(request.user):
            return Response(
                {"detail": "Profile already exists. Use PATCH to update."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ProfileWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save(user=request.user)
        return Response(
            ProfileReadSerializer(profile).data,
            status=status.HTTP_201_CREATED,
        )

    def patch(self, request):
        profile = self.get_object(request.user)
        if not profile:
            return Response(
                {"detail": "Profile does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ProfileWriteSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ProfileReadSerializer(profile).data)


class ProfileDetailView(generics.RetrieveAPIView):
    """GET /api/profiles/<uuid>/ — view someone else's profile."""

    queryset = Profile.objects.filter(is_visible=True).select_related("user")
    serializer_class = ProfileReadSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"


class ProfileBrowseView(generics.ListAPIView):
    """GET /api/profiles/ — browse profiles with filters."""

    serializer_class = ProfileReadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = (
            Profile.objects.filter(is_visible=True)
            .exclude(user=user)
            .select_related("user")
            .prefetch_related("interests__interest", "photos")
        )

        # Filter by gender
        gender = self.request.query_params.get("gender")
        if gender:
            qs = qs.filter(gender=gender)

        # Filter by interested_in (matching your gender)
        interested_in = self.request.query_params.get("interested_in")
        if interested_in:
            qs = qs.filter(interested_in=interested_in)

        # Filter by city
        city = self.request.query_params.get("city")
        if city:
            qs = qs.filter(city__icontains=city)

        # Filter by country
        country = self.request.query_params.get("country")
        if country:
            qs = qs.filter(country__icontains=country)

        # Age range
        min_age = self.request.query_params.get("min_age")
        max_age = self.request.query_params.get("max_age")
        if min_age or max_age:
            from datetime import date
            today = date.today()

            def age_to_dob(age, latest=True):
                # Latest=True → youngest person with that age
                if latest:
                    return date(today.year - age, today.month, today.day)
                return date(today.year - age - 1, today.month, today.day)

            if max_age:
                qs = qs.filter(date_of_birth__gte=age_to_dob(int(max_age), latest=False))
            if min_age:
                qs = qs.filter(date_of_birth__lte=age_to_dob(int(min_age), latest=True))

        # Search in display_name and bio
        search = self.request.query_params.get("q")
        if search:
            qs = qs.filter(Q(display_name__icontains=search) | Q(bio__icontains=search))

        return qs.order_by("-last_active")


class InterestListView(generics.ListAPIView):
    """GET /api/interests/ — list all available interests."""

    queryset = Interest.objects.all()
    serializer_class = InterestSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # return all at once


class MyPhotoListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/profiles/me/photos/ — list or upload your photos."""

    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)
        return Photo.objects.filter(profile=profile)

    def perform_create(self, serializer):
        profile = Profile.objects.get(user=self.request.user)

        if profile.photos.count() >= 6:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "You can have at most 6 photos."})

        # If this is the first photo, make it primary automatically
        is_first = not profile.photos.exists()
        serializer.save(profile=profile, is_primary=is_first)


class MyPhotoDeleteView(generics.DestroyAPIView):
    """DELETE /api/profiles/me/photos/<uuid>/ — remove a photo."""

    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        profile = Profile.objects.get(user=self.request.user)
        return Photo.objects.filter(profile=profile)