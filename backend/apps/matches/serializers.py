from rest_framework import serializers
from django.db import models
from apps.profiles.serializers import ProfileReadSerializer
from .models import *



class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ("id", "liker", "likee", "is_super_like", "created_at")
        read_only_fields = fields

class  MatchSerializer(serializers.ModelSerializer):
    """Match with the OTHER profile expanded for the frontend."""

    other_profile = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ("id", "matched_at", "is_active", "other_profile", "last_message")

    def get_other_profile(self, obj):
        me = self.context.get("me")
        other = obj.get_other_profile(me)
        return ProfileReadSerializer(other, context=self.context).data

    def get_last_message(self, obj):
        last = obj.messages.order_by("-created_at").first()
        if not last:
            return None
        return {
            "id": str(last.id),
            "content": last.content[:80],
            "created_at": last.created_at,
            "sender_id": str(last.sender_id),
        }

class PassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pass
        fields = ("id", "passer", "passed", "created_at")
        read_only_fields = fields

class LikeWithProfileSerializer(serializers.ModelSerializer):
    """A Like row with the OTHER profile expanded for the likes grid."""

    other_profile = serializers.SerializerMethodField()
    direction = serializers.SerializerMethodField()
    already_matched = serializers.SerializerMethodField()

    class Meta:
        model = Like
        fields = ("id", "created_at", "is_super_like", "direction", "already_matched", "other_profile")

    def get_direction(self, obj):
        """'received' if the other person liked me; 'sent' if I liked them."""
        me = self.context.get("me")
        return "received" if obj.likee_id == me.id else "sent"

    def get_other_profile(self, obj):
        me = self.context.get("me")
        other = obj.liker if obj.likee_id == me.id else obj.likee
        from apps.profiles.serializers import ProfileReadSerializer
        return ProfileReadSerializer(other, context=self.context).data

    def get_already_matched(self, obj):
        """True if a Match between the two exists (edge case: matched after like)."""
        me = self.context.get("me")
        other = obj.liker if obj.likee_id == me.id else obj.likee
        return Match.objects.filter(
            models.Q(profile_a=me, profile_b=other) | models.Q(profile_a=other, profile_b=me),
            is_active=True,
        ).exists()        