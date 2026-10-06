import pytest
from rest_framework.test import APIClient

from apps.tests.factories import UserFactory, ProfileFactory, LikeFactory, PassFactory
from apps.matches.models import Pass


@pytest.mark.django_db
class TestDiscover:
    def setup_method(self):
        self.client = APIClient()
        self.me_user = UserFactory(email="me@test.dev")
        self.me = ProfileFactory(user=self.me_user, gender="M", interested_in="F")
        self.client.force_authenticate(user=self.me_user)

    def test_discover_returns_compatible_profiles(self):
        # Compatible: Female, interested in Male
        compatible = ProfileFactory(gender="F", interested_in="M", is_visible=True)
        # Incompatible: Male, interested in Male
        ProfileFactory(gender="M", interested_in="M", is_visible=True)

        res = self.client.get("/api/profiles/discover/")
        assert res.status_code == 200
        assert res.data["count"] == 1
        assert res.data["results"][0]["id"] == str(compatible.id)

    def test_discover_excludes_invisible(self):
        ProfileFactory(gender="F", interested_in="M", is_visible=False)
        res = self.client.get("/api/profiles/discover/")
        assert res.data["count"] == 0

    def test_discover_excludes_liked(self):
        other = ProfileFactory(gender="F", interested_in="M")
        LikeFactory(liker=self.me, likee=other)
        res = self.client.get("/api/profiles/discover/")
        assert res.data["count"] == 0