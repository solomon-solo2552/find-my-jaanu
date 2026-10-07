import pytest
from rest_framework.test import APIClient

from apps.tests.factories import UserFactory, ProfileFactory, LikeFactory
from apps.matches.models import Like, Match, Pass


@pytest.mark.django_db
class TestMatches:
    def setup_method(self):
        self.client = APIClient()
        self.me_user = UserFactory(email="me@test.dev")
        self.me = ProfileFactory(user=self.me_user, gender="M", interested_in="F")
        self.client.force_authenticate(user=self.me_user)

        self.other_user = UserFactory(email="other@test.dev")
        self.other = ProfileFactory(user=self.other_user, gender="F", interested_in="M")

    def test_like_creates_like_no_match(self):
        res = self.client.post(f"/api/matches/like/{self.other.id}/")

        assert res.status_code == 201
        assert res.data["matched"] is False
        assert Like.objects.filter(liker=self.me, likee=self.other).exists()

    def test_like_creates_match_when_mutual(self):
        # The OTHER person likes me first (via factory — direct DB)
        LikeFactory(liker=self.other, likee=self.me)

        # Now I like them — the view should detect the mutual like
        res = self.client.post(f"/api/matches/like/{self.other.id}/")

        assert res.status_code == 201
        assert res.data["matched"] is True
        assert res.data["match"] is not None
        assert Match.objects.filter(is_active=True).count() == 1

    def test_cannot_like_self(self):
        res = self.client.post(f"/api/matches/like/{self.me.id}/")
        assert res.status_code == 400

    def test_cannot_like_twice(self):
        LikeFactory(liker=self.me, likee=self.other)
        res = self.client.post(f"/api/matches/like/{self.other.id}/")
        assert res.status_code == 200  # not created again

    def test_pass_creates_pass(self):
        res = self.client.post(f"/api/matches/pass/{self.other.id}/")
        assert res.status_code == 200
        assert Pass.objects.filter(passer=self.me, passed=self.other).exists()

    def test_list_matches_only_active(self):
        # Simulate: other liked me first, then I liked back → creates a Match
        LikeFactory(liker=self.other, likee=self.me)
        self.client.post(f"/api/matches/like/{self.other.id}/")

        # Sanity check: a match was created
        assert Match.objects.filter(is_active=True).count() == 1

        res = self.client.get("/api/matches/")
        assert res.status_code == 200
        assert res.data["count"] == 1

    def test_unmatch_deactivates(self):
        # Same setup: mutual like → Match
        LikeFactory(liker=self.other, likee=self.me)
        self.client.post(f"/api/matches/like/{self.other.id}/")

        match = Match.objects.first()
        assert match is not None, "Match should exist after mutual like"

        res = self.client.delete(f"/api/matches/{match.id}/unmatch/")

        assert res.status_code == 204
        match.refresh_from_db()
        assert match.is_active is False

    def test_discover_excludes_liked_and_passed(self):
        # Like one profile
        LikeFactory(liker=self.me, likee=self.other)

        res = self.client.get("/api/profiles/discover/")
        assert res.status_code == 200
        assert res.data["count"] == 0  # only other profile in DB, excluded
