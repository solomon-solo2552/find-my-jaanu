import uuid

from django.db import models


class Like(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    liker = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="likes_given",
    )
    likee = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="likes_received",
    )
    is_super_like = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "likes"
        unique_together = ("liker", "likee")
        indexes = [models.Index(fields=["liker", "likee"])]
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(liker=models.F("likee")),
                name="prevent_self_like",
            ),
        ]

    def __str__(self):
        return f"{self.liker.display_name} → {self.likee.display_name}"


class Match(models.Model):
    """A mutual like. Canonical ordering prevents (A,B)/(B,A) duplicates."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile_a = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="matches_as_a",
    )
    profile_b = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="matches_as_b",
    )
    matched_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "matches"
        unique_together = ("profile_a", "profile_b")
        ordering = ["-matched_at"]

    def save(self, *args, **kwargs):
        # Always store smaller UUID as profile_a, larger as profile_b
        if self.profile_a_id and self.profile_b_id and self.profile_a_id > self.profile_b_id:
            self.profile_a_id, self.profile_b_id = self.profile_b_id, self.profile_a_id
        super().save(*args, **kwargs)

    def get_other_profile(self, profile):
        """Given one participant, return the other."""
        return self.profile_b if self.profile_a == profile else self.profile_a

    def __str__(self):
        return f"Match: {self.profile_a.display_name} ↔ {self.profile_b.display_name}"


class Pass(models.Model):
    """Records when a user explicitly skips a profile - prevents seeing them again."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    passer = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="passes_given",
    )

    passed = models.ForeignKey(
        "profiles.Profile",
        on_delete=models.CASCADE,
        related_name="passes_received",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "passes"
        unique_together = ("passer", "passed")
        indexes = [models.Index(fields=["passer", "passed"])]
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(passer=models.F("passed")),
                name="prevent_self_pass",
            ),
        ]

    def __str__(self):
        return f"{self.passer.display_name} passed {self.passed.display_name}"
    