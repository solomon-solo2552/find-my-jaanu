from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.UUIDField(source="sender.id", read_only=True)
    sender_name = serializers.CharField(source="sender.display_name", read_only=True)

    class Meta:
        model = Message
        fields = ("id", "content", "sender_id", "sender_name", "message_type", "is_read", "created_at")
        read_only_fields = fields