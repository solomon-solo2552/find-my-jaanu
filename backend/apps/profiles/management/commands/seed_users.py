"""
Seed the database with fake users, profiles, photos, interests, matches, and messages.

Usage:
    python manage.py seed_users              # default: 25 users, 5 matches
    python manage.py seed_users --count 50   # 50 users
    python manage.py seed_users --reset      # wipe existing seeded data first
"""
import random
import urllib.request
from datetime import date, timedelta
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from faker import Faker

from apps.chat.models import Message
from apps.matches.models import Like, Match
from apps.profiles.models import Interest, Photo, Profile, ProfileInterest
from apps.users.models import User

fake = Faker()

# -------- Config --------
BIOS = [
    "Coffee addict. Weekend hiker. Bad at small talk but great at chai conversations.",
    "Looking for someone to argue about movies with.",
    "Engineer by day, chef by night. My biryani is legendary.",
    "I'll beat you at Scrabble. Politely, of course.",
    "Dog person. Will show you pictures of my golden retriever unprompted.",
    "If you can make me laugh, you're already 80% there.",
    "Traveler, photographer, occasional poet.",
    "Introvert who found out other introverts exist. Hi.",
    "Pizza is a food group. Fight me.",
    "Looking for a partner in crime for late-night maggi.",
    "Yoga in the morning, wine in the evening. Balance.",
    "Gym is my therapy. Music is my soul.",
    "I read more books than I finish. It's a problem.",
    "Looking for someone who values deep conversations over small talk.",
    "Plant parent. Ask me about my monstera.",
    "Runner. Reader. Recovering perfectionist.",
    "If you know the best momos in the city, we should talk.",
    "Not here for hookups. Genuinely want to find someone.",
    "My love language is sending memes at 2am.",
    "Fluent in sarcasm, bad at pickup lines.",
]

CITIES = [
    ("Mumbai", "India"), ("Delhi", "India"), ("Bangalore", "India"),
    ("Pune", "India"), ("Hyderabad", "India"), ("Chennai", "India"),
    ("Kolkata", "India"), ("Goa", "India"), ("Jaipur", "India"),
    ("Ahmedabad", "India"), ("Lucknow", "India"), ("Chandigarh", "India"),
]

MALE_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Reyansh", "Kabir", "Rohan", "Rishi",
    "Dhruv", "Yash", "Karan", "Kunal", "Rahul", "Nikhil", "Aryan", "Dev",
]

FEMALE_NAMES = [
    "Aanya", "Diya", "Saanvi", "Ananya", "Aadhya", "Riya", "Priya", "Neha",
    "Isha", "Kavya", "Anika", "Mira", "Tara", "Zara", "Sara", "Naina",
]

CHAT_LINES_A = [
    "Hey! How's your day going?",
    "So what do you do for fun?",
    "Chai or coffee?",
    "What's your favorite place you've traveled to?",
    "Random question: cat person or dog person?",
    "I noticed we both like {interest}. Tell me more!",
    "Weekend plans?",
    "What's the last movie you watched?",
]

CHAT_LINES_B = [
    "Pretty good! Just finished work. You?",
    "I love hiking and painting.",
    "Chai forever. Coffee is overrated, don't @ me.",
    "Bali. But I really want to visit Ladakh next.",
    "Dogs. Obviously.",
    "Oh nice! Yeah, {interest} is a big part of my life.",
    "Not much, chilling at home. You?",
    "Just rewatched Interstellar. Still hits different.",
]


def download_image(url: str) -> ContentFile:
    """Fetch an image from a URL and return as a Django ContentFile."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return ContentFile(resp.read())


class Command(BaseCommand):
    help = "Seed the database with fake users, profiles, matches, and messages."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=25, help="Number of users to create")
        parser.add_argument("--reset", action="store_true", help="Delete existing seeded data first")

    @transaction.atomic
    def handle(self, *args, **options):
        count = options["count"]
        reset = options["reset"]

        if reset:
            self.stdout.write("🧹 Deleting existing seeded data...")
            # Delete seeded users by email pattern
            User.objects.filter(email__endswith="@seed.jaanu.dev").delete()
            self.stdout.write("   Done.")

        # Ensure interests exist
        if not Interest.objects.exists():
            self.stdout.write("⚠️  No interests found. Run `python manage.py seed_interests` first.")
            return

        interests_all = list(Interest.objects.all())

        # ---------- 1. Create users + profiles + photos ----------
        self.stdout.write(f"👥 Creating {count} users...")
        profiles_created = []

        for i in range(count):
            email = f"user{i+1}@seed.jaanu.dev"
            if User.objects.filter(email=email).exists():
                continue

            # 50/50 male/female
            is_male = i % 2 == 0
            first_name = random.choice(MALE_NAMES if is_male else FEMALE_NAMES)
            last_name = fake.last_name()
            display_name = f"{first_name} {last_name[0]}."

            # Create user
            user = User.objects.create_user(
                email=email,
                password="SeedUser123!",
                is_active=True,
                is_verified=random.choice([True, True, False]),  # mostly verified
            )

            # Profile
            age = random.randint(22, 35)
            dob = date.today() - timedelta(days=age * 365 + random.randint(0, 364))
            city, country = random.choice(CITIES)

            profile = Profile.objects.create(
                user=user,
                display_name=display_name,
                bio=random.choice(BIOS),
                date_of_birth=dob,
                gender="M" if is_male else "F",
                interested_in="F" if is_male else "M",
                city=city,
                country=country,
                is_visible=True,
            )

            # Interests (3–6 random)
            picked = random.sample(interests_all, k=random.randint(3, 6))
            for interest in picked:
                ProfileInterest.objects.create(profile=profile, interest=interest)

            # Photos: 2–4 from pravatar
            n_photos = random.randint(2, 4)
            for idx in range(n_photos):
                url = f"https://i.pravatar.cc/600?u={email}-{idx}"
                try:
                    content = download_image(url)
                    photo = Photo(profile=profile, is_primary=(idx == 0), order=idx)
                    photo.image.save(
                        f"{slugify(display_name)}-{idx}.jpg",
                        content,
                        save=True,
                    )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"   ⚠️  Failed to fetch photo: {e}"))

            profiles_created.append(profile)

        self.stdout.write(f"   ✅ Created {len(profiles_created)} profiles")

        # ---------- 2. Create matches + messages ----------
        self.stdout.write("💘 Creating matches and chat history...")
        matches_created = 0

        # Build the male/female pools
        males = [p for p in profiles_created if p.gender == "M"]
        females = [p for p in profiles_created if p.gender == "F"]

        target_matches = min(5, len(males), len(females))
        used_pairs = set()

        for _ in range(target_matches):
            m = random.choice(males)
            f = random.choice(females)
            key = tuple(sorted([str(m.id), str(f.id)]))
            if key in used_pairs:
                continue
            used_pairs.add(key)

            # Create reciprocal likes
            Like.objects.get_or_create(liker=m, likee=f)
            Like.objects.get_or_create(liker=f, likee=m)

            # Canonical match ordering
            a, b = sorted([m, f], key=lambda p: str(p.id))
            match, _ = Match.objects.get_or_create(profile_a=a, profile_b=b)
            matches_created += 1

            # Messages (3–8 lines, alternating)
            n_msgs = random.randint(3, 8)
            interests = list(m.interests.values_list("interest__name", flat=True)) or ["travel"]
            for j in range(n_msgs):
                if j % 2 == 0:
                    sender, text = m, random.choice(CHAT_LINES_A)
                else:
                    sender, text = f, random.choice(CHAT_LINES_B)
                text = text.format(interest=random.choice(interests))
                msg = Message.objects.create(
                    match=match,
                    sender=sender,
                    content=text,
                    message_type="text",
                    is_read=True,
                )
                # Backdate timestamps
                offset = timedelta(minutes=(n_msgs - j) * 30)
                Message.objects.filter(pk=msg.pk).update(
                    created_at=msg.created_at - offset
                )

        self.stdout.write(f"   ✅ Created {matches_created} matches")

        # ---------- 3. Summary ----------
        self.stdout.write(self.style.SUCCESS(
            f"\n✨ Done! Seeded users: {User.objects.filter(email__endswith='@seed.jaanu.dev').count()}, "
            f"profiles: {Profile.objects.count()}, matches: {Match.objects.count()}, "
            f"messages: {Message.objects.count()}"
        ))
        self.stdout.write(
            "\n🔑 All seeded users have password: SeedUser123!"
            "\n   Emails look like: user1@seed.jaanu.dev, user2@seed.jaanu.dev, ..."
        )

        