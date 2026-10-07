import pytest
from rest_framework.test import APIClient

from apps.tests.factories import UserFactory, ProfileFactory
from apps.matches.models import Match
from apps.safety.models import Report, Block


@pytest.mark.django_db
class TestSafety:
    def setup_method(self):
        self.client = APIClient()
        self.me_user = UserFactory(email="me@test.dev")
        self.me = ProfileFactory(user=self.me_user)
        self.client.force_authenticate(user=self.me_user)

        self.other_user = UserFactory(email="other@test.dev")
        self.other = ProfileFactory(user=self.other_user)

    def test_report_creates_row(self):
        res = self.client.post(
            f"/api/safety/report/{self.other.id}/",
            {
                "reason": "harassment",
                "details": "Sent creepy messages",
            },
            format="json",
        )

        assert res.status_code == 201
        assert Report.objects.filter(reporter=self.me, reported=self.other).exists()

    def test_report_invalid_reason(self):
        res = self.client.post(
            f"/api/safety/report/{self.other.id}/",
            {
                "reason": "not_a_real_reason",
            },
            format="json",
        )
        assert res.status_code == 400

    def test_cannot_report_self(self):
        res = self.client.post(
            f"/api/safety/report/{self.me.id}/",
            {
                "reason": "spam",
            },
            format="json",
        )
        assert res.status_code == 400

    def test_block_creates_block(self):
        res = self.client.post(f"/api/safety/block/{self.other.id}/")
        assert res.status_code in (200, 201)
        assert Block.objects.filter(blocker=self.me, blocked=self.other).exists()

    def test_block_deactivates_match(self):
        a, b = sorted([self.me, self.other], key=lambda p: str(p.id))
        match = Match.objects.create(profile_a=a, profile_b=b, is_active=True)

        self.client.post(f"/api/safety/block/{self.other.id}/")

        match.refresh_from_db()
        assert match.is_active is False

    def test_unblock_removes_block(self):
        Block.objects.create(blocker=self.me, blocked=self.other)

        res = self.client.delete(f"/api/safety/block/{self.other.id}/")
        assert res.status_code == 204
        assert not Block.objects.filter(blocker=self.me, blocked=self.other).exists()

    def test_blocked_list_returns_only_mine(self):
        Block.objects.create(blocker=self.me, blocked=self.other)

        res = self.client.get("/api/safety/blocked/")
        assert res.status_code == 200
        assert res.data["count"] == 1

    def test_cannot_like_blocked_user(self):
        Block.objects.create(blocker=self.me, blocked=self.other)

        res = self.client.post(f"/api/matches/like/{self.other.id}/")
        assert res.status_code == 403

    def test_blocked_user_hidden_from_discover(self):
        self.me.gender = "M"
        self.me.interested_in = "F"
        self.me.save()
        self.other.gender = "F"
        self.other.interested_in = "M"
        self.other.save()

        # Before block: other is in discover
        res = self.client.get("/api/profiles/discover/")
        assert res.data["count"] == 1

        # Block them
        Block.objects.create(blocker=self.me, blocked=self.other)

        # After block: excluded
        res = self.client.get("/api/profiles/discover/")
        assert res.data["count"] == 0
