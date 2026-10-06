import factory
from datetime import date, timedelta
from django.contrib.auth import get_user_model

from apps.profiles.models import Profile, Interest
from apps.matches.models import Like, Match, Pass
from apps.chat.models import Message

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@test.dev")
    password = factory.PostGenerationMethodCall("set_password", "TestPass123!")
    is_active = True


class ProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Profile

    user = factory.SubFactory(UserFactory)
    display_name = factory.Sequence(lambda n: f"Test User {n}")
    bio = "Testing bio"
    date_of_birth = factory.LazyFunction(lambda: date.today() - timedelta(days=25 * 365))
    gender = "M"
    interested_in = "F"
    city = "Mumbai"
    country = "India"
    is_visible = True


class InterestFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Interest
        django_get_or_create = ("name",)

    name = factory.Sequence(lambda n: f"Interest {n}")
    emoji = "✨"


class LikeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Like

    liker = factory.SubFactory(ProfileFactory)
    likee = factory.SubFactory(ProfileFactory)


class MatchFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Match

    profile_a = factory.SubFactory(ProfileFactory)
    profile_b = factory.SubFactory(ProfileFactory)

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        # Ensure profiles are different
        if kwargs.get("profile_a") and kwargs.get("profile_b"):
            if kwargs["profile_a"].id == kwargs["profile_b"].id:
                kwargs["profile_b"] = ProfileFactory()
        return super()._create(model_class, *args, **kwargs)


class MessageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Message

    match = factory.SubFactory(MatchFactory)
    sender = factory.LazyAttribute(lambda o: o.match.profile_a)
    content = "Test message"
    message_type = "text"

class PassFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Pass

    passer = factory.SubFactory(ProfileFactory)
    passed = factory.SubFactory(ProfileFactory)