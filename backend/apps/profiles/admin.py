from django.contrib import admin

from .models import Profile, Interest, ProfileInterest, Photo


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("display_name", "user", "gender", "city", "is_visible", "last_active")
    list_filter = ("gender", "interested_in", "is_visible", "country")
    search_fields = ("display_name", "user__email", "city")
    readonly_fields = ("created_at", "updated_at", "last_active")


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