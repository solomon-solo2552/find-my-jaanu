import pytest
from rest_framework.test import APIClient

from apps.tests.factories import UserFactory, ProfileFactory, LikeFactory, MatchFactory
from apps.matches.models import Match
from apps.chat.models import Message


@pytest.mark.django_db
class TestChat:
    def setup_method(self):
        self.client = APIClient()
        self.me_user = UserFactory(email="me@test.dev")
        self.me = ProfileFactory(user=self.me_user, gender="M", interested_in="F")
        self.client.force_authenticate(user=self.me_user)

        self.other_user = UserFactory(email="other@test.dev")
        self.other = ProfileFactory(user=self.other_user, gender="F", interested_in="M")

        # Create a match
        a, b = sorted([self.me, self.other], key=lambda p: str(p.id))
        self.match = Match.objects.create(profile_a=a, profile_b=b)

    def test_get_match_info(self):
        res = self.client.get(f"/api/chat/{self.match.id}/info/")
        assert res.status_code == 200
        assert res.data["other_profile"]["display_name"] == self.other.display_name

    def test_send_message(self):
        res = self.client.post(
            f"/api/chat/{self.match.id}/send/", {"content": "Hello!"}, format="json"
        )

        assert res.status_code == 201
        assert res.data["content"] == "Hello!"
        assert Message.objects.count() == 1

    def test_send_empty_message_fails(self):
        res = self.client.post(
            f"/api/chat/{self.match.id}/send/", {"content": "   "}, format="json"
        )
        assert res.status_code == 400

    def test_send_message_too_long_fails(self):
        res = self.client.post(
            f"/api/chat/{self.match.id}/send/", {"content": "a" * 2001}, format="json"
        )
        assert res.status_code == 400

    def test_history_returns_messages(self):
        Message.objects.create(match=self.match, sender=self.me, content="Hi")
        Message.objects.create(match=self.match, sender=self.other, content="Hey")

        res = self.client.get(f"/api/chat/{self.match.id}/messages/")
        assert res.status_code == 200
        assert len(res.data["results"]) == 2

    def test_cannot_access_other_users_match(self):
        # Create a third party
        third_user = UserFactory(email="third@test.dev")
        ProfileFactory(user=third_user)
        self.client.force_authenticate(user=third_user)

        res = self.client.get(f"/api/chat/{self.match.id}/messages/")
        assert res.status_code == 200
        assert len(res.data["results"]) == 0  # empty, not forbidden

    def test_send_message_on_inactive_match_fails(self):
        self.match.is_active = False
        self.match.save()

        res = self.client.post(
            f"/api/chat/{self.match.id}/send/", {"content": "Hello?"}, format="json"
        )

        assert res.status_code == 404
