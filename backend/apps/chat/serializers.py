from rest_framework import serializers
from .models import Message
from django.utils import timezone
from datetime import timedelta

class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.UUIDField(source="sender.id", read_only=True)
    sender_name = serializers.CharField(source="sender.display_name", read_only=True)
    image = serializers.SerializerMethodField()
    can_delete_for_everyone = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ("id", "content", "sender_id", "sender_name", "message_type", "is_read", "created_at", "image", "is_deleted", "can_delete_for_everyone",)
        read_only_fields = fields

    def get_image(self, obj):
        if obj.is_deleted:
            return None
        # Prefer local uploaded image
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute-uri(obj.image.url)
            return obj.image.url
        # Fallback to external GIF URL
        if obj.image_url:
            return obj.image_url
        return None 

    def get_can_delete_for_everyone(self, obj):
        """Only sender, only within 15 minutes, only if not already deleted."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        if obj.is_deleted:
            return False

        me = getattr(request.user, "profile", None)
        if not me or obj.sender_id != me.id:
            return False

        cutoff = timezone.now() - timedelta(minutes=15)
        return obj.created_at >= cutoff