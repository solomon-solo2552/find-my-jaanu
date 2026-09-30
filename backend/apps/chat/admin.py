from django.contrib import admin

from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("match", "sender", "short_content", "is_read", "created_at")
    list_filter = ("message_type", "is_read")
    search_fields = ("content", "sender__display_name")
    ordering = ("-created_at",)

    def short_content(self, obj):
        return obj.content[:50]
    short_content.short_description = "Content"