from rest_framework import serializers

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
        