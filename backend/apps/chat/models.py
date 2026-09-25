import uuid

from django.db import models


class Message(models.Model):
    TYPE_CHOICES = [
        ("text", "Text"),
        ("image", "Image"),
        ("system", "System"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    match = models.ForeignKey(
        "matches.Match",
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="messages_sent",
    )
    content = models.TextField(max_length=2000)
    message_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="text")
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "messages"
        ordering = ["created_at"]
        indexes = [models.Index(fields=["match", "created_at"])]

    def __str__(self):
        return f"{self.sender.display_name}: {self.content[:40]}"