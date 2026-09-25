from django.contrib import admin

from .models import Like, Match


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("liker", "likee", "is_super_like", "created_at")
    list_filter = ("is_super_like",)
    search_fields = ("liker__display_name", "likee__display_name")


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ("profile_a", "profile_b", "is_active", "matched_at")
    list_filter = ("is_active",)