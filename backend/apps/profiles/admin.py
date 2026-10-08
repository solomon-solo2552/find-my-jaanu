from django.contrib import admin

from .models import Profile, Interest, ProfileInterest, Photo


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("display_name", "user", "gender", "city", "is_featured", "is_visible", "last_active")
    list_filter = ("is_featured", "gender", "interested_in", "is_visible", "country")
    search_fields = ("display_name", "user__email", "city")
    readonly_fields = ("created_at", "updated_at", "last_active")
    list_editable = ("is_featured",)

    fieldsets = (
        (None, {
            "fields": ("user", "display_name", "bio", "date_of_birth", "gender", "interested_in")
        }),
        ("Location", {
            "fields": ("city", "country", "latitude", "longitude")
        }),
        ("Visibility & Featured", {
            "fields": ("is_visible", "is_featured", "featured_note"),
            "description": "Featured profiles appear first in Discover and Daily Picks."
        }),
        ("Timestamps", {
            "fields": ("last_active", "created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ("name", "emoji")
    search_fields = ("name",)


@admin.register(ProfileInterest)
class ProfileInterestAdmin(admin.ModelAdmin):
    list_display = ("profile", "interest")
    list_filter = ("interest",)


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ("profile", "is_primary", "order", "uploaded_at")
    list_filter = ("is_primary",)