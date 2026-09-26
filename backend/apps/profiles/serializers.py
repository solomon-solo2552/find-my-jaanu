from datetime import date

from django.db import transaction
from rest_framework import serializers

from .models import Profile, Interest, ProfileInterest, Photo


# ---------- Interest ----------
class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ("id", "name", "emoji")


# ---------- Photo ----------
class PhotoSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=True)

    class Meta:
        model = Photo
        fields = ("id", "image", "is_primary", "order", "uploaded_at")
        read_only_fields = ("id", "uploaded_at")


# ---------- Profile READ (nested) ----------
class ProfileReadSerializer(serializers.ModelSerializer):
    interests = serializers.SerializerMethodField()
    photos = PhotoSerializer(many=True, read_only=True)
    age = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "user_email",
            "display_name",
            "bio",
            "date_of_birth",
            "age",
            "gender",
            "interested_in",
            "city",
            "country",
            "latitude",
            "longitude",
            "is_visible",
            "last_active",
            "created_at",
            "updated_at",
            "interests",
            "photos",
        )

    def get_age(self, obj):
        today = date.today()
        dob = obj.date_of_birth
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    def get_interests(self, obj):
        # ProfileInterest rows → flat list of interests
        return InterestSerializer(
            [pi.interest for pi in obj.interests.select_related("interest")],
            many=True,
        ).data


# ---------- Profile WRITE (flat) ----------
class ProfileWriteSerializer(serializers.ModelSerializer):
    interest_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    class Meta:
        model = Profile
        fields = (
            "display_name",
            "bio",
            "date_of_birth",
            "gender",
            "interested_in",
            "city",
            "country",
            "latitude",
            "longitude",
            "is_visible",
            "interest_ids",
        )

    def validate_date_of_birth(self, value):
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old.")
        if age > 120:
            raise serializers.ValidationError("Please enter a valid date of birth.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        interest_ids = validated_data.pop("interest_ids", [])
        profile = Profile.objects.create(**validated_data)
        self._set_interests(profile, interest_ids)
        return profile

    @transaction.atomic
    def update(self, instance, validated_data):
        interest_ids = validated_data.pop("interest_ids", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if interest_ids is not None:
            self._set_interests(instance, interest_ids)

        return instance

    def _set_interests(self, profile, interest_ids):
        # Validate the IDs actually exist
        interests = Interest.objects.filter(id__in=interest_ids)
        if len(interests) != len(set(interest_ids)):
            raise serializers.ValidationError(
                {"interest_ids": "One or more interests do not exist."}
            )
        # Replace all existing interests
        ProfileInterest.objects.filter(profile=profile).delete()
        ProfileInterest.objects.bulk_create(
            [ProfileInterest(profile=profile, interest=i) for i in interests]
        )