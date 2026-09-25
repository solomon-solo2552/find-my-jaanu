import uuid

from django.db import models


class Report(models.Model):
    REASON_CHOICES = [
        ("spam", "Spam"),
        ("harassment", "Harassment"),
        ("fake", "Fake profile"),
        ("inappropriate", "Inappropriate content"),
        ("other", "Other"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("reviewed", "Reviewed"),
        ("actioned", "Actioned"),
        ("dismissed", "Dismissed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="reports_made",
    )
    reported = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="reports_received",
    )
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    details = models.TextField(max_length=500, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reports"
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                check=~models.Q(reporter=models.F("reported")),
                name="prevent_self_report",
            ),
        ]

    def __str__(self):
        return f"{self.reporter.display_name} reported {self.reported.display_name} ({self.reason})"


class Block(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blocker = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="blocks_made",
    )
    blocked = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="blocks_received",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "blocks"
        unique_together = ("blocker", "blocked")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.blocker.display_name} blocked {self.blocked.display_name}"