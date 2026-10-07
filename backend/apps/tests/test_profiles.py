import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from datetime import date, timedelta

from apps.tests.factories import UserFactory, ProfileFactory, InterestFactory
from apps.profiles.models import Profile


@pytest.mark.django_db
class TestProfiles:
    def setup_method(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_create_profile(self):
        res = self.client.post(
            "/api/profiles/me/",
            {
                "display_name": "Test",
                "bio": "Hello",
                "date_of_birth": "1995-05-15",
                "gender": "M",
                "interested_in": "F",
                "city": "Mumbai",
                "country": "India",
            },
            format="json",
        )

        assert res.status_code == 201
        assert res.data["display_name"] == "Test"
        assert res.data["age"] >= 28  # born 1995

    def test_create_profile_underage(self):
        res = self.client.post(
            "/api/profiles/me/",
            {
                "display_name": "Kid",
                "date_of_birth": "2015-05-15",
                "gender": "M",
                "interested_in": "F",
            },
            format="json",
        )

        assert res.status_code == 400
        assert "date_of_birth" in res.data

    def test_profile_duplicate_creation_fails(self):
        ProfileFactory(user=self.user)
        res = self.client.post(
            "/api/profiles/me/",
            {
                "display_name": "Another",
                "date_of_birth": "1995-01-01",
                "gender": "M",
                "interested_in": "F",
            },
            format="json",
        )
        assert res.status_code == 400

    def test_get_my_profile_404_when_missing(self):
        res = self.client.get("/api/profiles/me/")
        assert res.status_code == 404

    def test_update_profile(self):
        ProfileFactory(user=self.user)

        res = self.client.patch(
            "/api/profiles/me/",
            {
                "bio": "Updated bio",
            },
            format="json",
        )

        assert res.status_code == 200
        assert res.data["bio"] == "Updated bio"

    def test_interests_must_exist(self):
        ProfileFactory(user=self.user)
        res = self.client.patch(
            "/api/profiles/me/",
            {
                "interest_ids": [99999],
            },
            format="json",
        )

        assert res.status_code == 400

    def test_create_profile_with_interests(self):
        i1 = InterestFactory()
        i2 = InterestFactory()

        res = self.client.post(
            "/api/profiles/me/",
            {
                "display_name": "Test",
                "date_of_birth": "1995-05-15",
                "gender": "M",
                "interested_in": "F",
                "interest_ids": [i1.id, i2.id],
            },
            format="json",
        )

        assert res.status_code == 201
        assert len(res.data["interests"]) == 2
