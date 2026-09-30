import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.db.models import Q

from apps.matches.models import Match
from apps.profiles.models import Profile
from .models import Message


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for a single match's chat room."""

    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close(code=4001)
            return

        self.match_id = self.scope["url_route"]["kwargs"]["match_id"]
        self.room_group_name = f"chat_{self.match_id}"

        # Load profile and match
        self.profile = await self.get_profile(user)
        if not self.profile:
            await self.close(code=4002)
            return

        self.match = await self.get_match(self.match_id, self.profile)
        if not self.match:
            await self.close(code=4003)
            return

        # Join the group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        content = (data.get("content") or "").strip()
        if not content:
            return
        if len(content) > 2000:
            await self.send(text_data=json.dumps({
                "type": "error",
                "detail": "Message too long.",
            }))
            return

        # Persist message
        message = await self.save_message(self.match, self.profile, content)

        # Broadcast to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": str(message.id),
                    "content": message.content,
                    "sender_id": str(self.profile.id),
                    "sender_name": self.profile.display_name,
                    "created_at": message.created_at.isoformat(),
                },
            },
        )

    async def chat_message(self, event):
        """Handler for messages broadcast by group_send (matches the `type`)."""
        await self.send(text_data=json.dumps(event["message"]))

    # ---------- DB helpers ----------
    @database_sync_to_async
    def get_profile(self, user):
        return Profile.objects.filter(user=user).first()

    @database_sync_to_async
    def get_match(self, match_id, profile):
        return Match.objects.filter(
            Q(profile_a=profile) | Q(profile_b=profile),
            id=match_id,
            is_active=True,
        ).first()

    @database_sync_to_async
    def save_message(self, match, sender, content):
        return Message.objects.create(
            match=match,
            sender=sender,
            content=content,
            message_type="text",
        )