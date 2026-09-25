import uuid

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Profile(models.Model):
    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
        ("NB", "Non-binary"),
        ("P", "Prefer not to say"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        related_name="profile",
    )
    display_name = models.CharField(max_length=50)
    bio = models.TextField(max_length=500, blank=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=2, choices=GENDER_CHOICES)
    interested_in = models.CharField(max_length=2, choices=GENDER_CHOICES)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_visible = models.BooleanField(default=True)
    last_active = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "profiles"
        ordering = ["-last_active"]
        indexes = [
            models.Index(fields=["city"]),
            models.Index(fields=["last_active"]),
        ]

    def __str__(self):
        return f"{self.display_name} ({self.user.email})"


class Interest(models.Model):
    """Lookup table — e.g., Hiking, Coding, Chai."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    emoji = models.CharField(max_length=5, blank=True)

    class Meta:
        db_table = "interests"
        ordering = ["name"]

    def __str__(self):
        return f"{self.emoji} {self.name}".strip()


class ProfileInterest(models.Model):
    """M:N through table linking Profile ↔ Interest."""

    id = models.AutoField(primary_key=True)
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="interests",
    )
    interest = models.ForeignKey(
        Interest,
        on_delete=models.CASCADE,
        related_name="profiles",
    )

    class Meta:
        db_table = "profile_interests"
        unique_together = ("profile", "interest")

    def __str__(self):
        return f"{self.profile.display_name} → {self.interest.name}"


class Photo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="photos",
    )
    image = models.ImageField(upload_to="profiles/%Y/%m/")
    is_primary = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "photos"
        ordering = ["order", "uploaded_at"]

    def save(self, *args, **kwargs):
        # Ensure only ONE primary photo per profile
        if self.is_primary:
            Photo.objects.filter(profile=self.profile, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Photo of {self.profile.display_name} ({'primary' if self.is_primary else 'secondary'})"