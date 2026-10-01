from rest_framework import serializers

from .models import Report, Block 


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ("id", "reporter", "reported", "reason", "details", "status", "created_at")
        read_only_fields = ("id", "reporter", "status", "created_at")

class BlockSerializer(serializers.ModelSerializer):
    blocked_display_name = serializers.CharField(
        source="blocked.display_name", read_only=True
    )
    blocked_photo = serializers.SerializerMethodField()

    class Meta:
        model = Block
        fields = ("id", "blocked", "blocked_display_name", "blocked_photo", "created_at")
        read_only_fields = ("id", "created_at")

    def get_blocked_photo(self, obj):
        primary = obj.blocked.photos.filter(is_primary=True).first() or obj.blocked.photos.first()
        if not primary:
            return None
        request = self.context.get("request")
        url = primary.image.url
        return request.build_absolute_uri(url) if request else url