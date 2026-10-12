from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.UUIDField(source="sender.id", read_only=True)
    sender_name = serializers.CharField(source="sender.display_name", read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ("id", "content", "sender_id", "sender_name", "message_type", "is_read", "created_at", "image",)
        read_only_fields = fields

    def get_image(self, obj):
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