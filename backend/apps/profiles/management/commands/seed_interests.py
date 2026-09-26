from django.core.management.base import BaseCommand

from apps.profiles.models import Interest

INTERESTS = [
    ("Hiking", "🥾"),
    ("Coding", "💻"),
    ("Chai", "☕"),
    ("Reading", "📚"),
    ("Cooking", "🍳"),
    ("Music", "🎵"),
    ("Travel", "✈️"),
    ("Gym", "🏋️"),
    ("Gaming", "🎮"),
    ("Movies", "🎬"),
    ("Photography", "📷"),
    ("Art", "🎨"),
    ("Dancing", "💃"),
    ("Yoga", "🧘"),
    ("Coffee", "☕"),
    ("Pets", "🐶"),
    ("Foodie", "🍜"),
    ("Startups", "🚀"),
    ("Fashion", "👗"),
    ("Cricket", "🏏"),
]


class Command(BaseCommand):
    help = "Seed the Interest table with default interests."

    def handle(self, *args, **options):
        created = 0
        for name, emoji in INTERESTS:
            _, was_created = Interest.objects.get_or_create(
                name=name, defaults={"emoji": emoji}
            )
            if was_created:
                created += 1
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Seed complete. {created} new interests added "
                f"({Interest.objects.count()} total)."
            )
        )