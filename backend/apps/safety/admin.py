from django.contrib import admin

from .models import Report, Block


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("reporter", "reported", "reason", "status", "created_at")
    list_filter = ("reason", "status")
    search_fields = ("reporter__display_name", "reported__display_name")


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ("blocker", "blocked", "created_at")