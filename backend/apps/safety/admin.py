from django.contrib import admin, messages

from .models import Report, Block


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("reporter", "reported", "reason", "status", "created_at")
    list_filter = ("reason", "status", "created_at")
    search_fields = ("reporter__diplay_name", "reported__display_name", "details")
    readonly_fields = ("id", "reporter", "reported", "reason", "details", "created_at")
    ordering = ("-created_at",)
    actions = ["mark_reviewed", "mark_actioned", "mark_dismissed"]

    fieldsets = (
        ("Report details", {
            "fields": ("id", "reporter", "reported", "reason", "details", "created_at")
        }),
        ("Moderation", {
            "fields": ("status",),
            "description": "Update the status after reviewing this report."
        }),
    )

    @admin.action(description="Mark selected reports as Reviewed")
    def mark_reviewed(self, request, queryset):
        updated = queryset.update(status="reviewed")
        self.message_user(
            request, f"{updated} report(s) marked as reviewed.", messages.SUCCESS
        )

    @admin.action(description="Mark selected reports as Actioned")
    def mark_actioned(self, request, queryset):
        updated = queryset.update(status="actioned")
        self.message_user(
            request, f"{updated} report(s) marked as actioned.", messages.SUCCESS
        )

    @admin.action(description="Dismiss selected reports")
    def mark_dismissed(self, request, queryset):
        updated = queryset.update(status="dismissed")
        self.message_user(
            request, f"{updated} report(s) dismissed.", messages.SUCCESS
        )

@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ("blocker", "blocked", "created_at")
    list_filter = ("created_at",)
    search_fields = ("blocker__display_name", "blocked__display_name")
    ordering = ("-created_at",)