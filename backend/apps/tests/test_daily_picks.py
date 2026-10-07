import pytest
from datetime import date
from rest_framework.test import APIClient

from apps.tests.factories import UserFactory, ProfileFactory, InterestFactory, LikeFactory
from apps.profiles.models import ProfileInterest
from apps.matches.daily_picks import get_daily_picks, seconds_until_reset


@pytest.mark.django_db
class TestDailyPicks:
    def setup_method(self):
        self.client = APIClient()
        self.me_user = UserFactory()
        self.me = ProfileFactory(user=self.me_user, gender="M", interested_in="F")
        self.client.force_authenticate(user=self.me_user)

    def _make_candidates(self, n=10):
        candidates = []
        for i in range(n):
            u = UserFactory(email=f"c{i}@test.dev")
            p = ProfileFactory(user=u, gender="F", interested_in="M", city="Mumbai")
            candidates.append(p)
        return candidates

    def test_returns_up_to_5(self):
        self._make_candidates(10)
        res = self.client.get("/api/matches/daily-picks/")
        assert res.status_code == 200
        assert len(res.data["results"]) == 5

    def test_returns_all_when_fewer_than_5(self):
        self._make_candidates(3)
        res = self.client.get("/api/matches/daily-picks/")
        assert len(res.data["results"]) == 3

    def test_deterministic_same_day(self):
        self._make_candidates(10)
        res1 = self.client.get("/api/matches/daily-picks/")
        res2 = self.client.get("/api/matches/daily-picks/")
        ids1 = [p["id"] for p in res1.data["results"]]
        ids2 = [p["id"] for p in res2.data["results"]]
        assert ids1 == ids2

    def test_excludes_liked(self):
        candidates = self._make_candidates(10)
        # Like one
        LikeFactory(liker=self.me, likee=candidates[0])

        res = self.client.get("/api/matches/daily-picks/")
        ids = [p["id"] for p in res.data["results"]]
        assert str(candidates[0].id) not in ids

    def test_prefers_shared_interests(self):
        candidates = self._make_candidates(10)
        # Give `me` an interest
        interest = InterestFactory(name="Hiking")
        ProfileInterest.objects.create(profile=self.me, interest=interest)

        # Give one candidate the same interest
        ProfileInterest.objects.create(profile=candidates[0], interest=interest)

        picks = get_daily_picks(self.me, count=5)
        pick_ids = [p.id for p in picks]
        # The one with the shared interest should be included
        assert candidates[0].id in pick_ids

    def test_seconds_until_reset_is_positive(self):
        assert seconds_until_reset() > 0