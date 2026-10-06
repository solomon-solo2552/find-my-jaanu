import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.tests.factories import UserFactory


@pytest.mark.django_db
class TestAuth:
    def setup_method(self):
        self.client = APIClient()
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.me_url = "/api/auth/me/"

    def test_register_success(self):
        res = self.client.post(self.register_url, {
            "email": "new@test.dev",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }, format="json")

        assert res.status_code == 201
        assert "access" in res.data
        assert "refresh" in res.data
        assert res.data["user"]["email"] == "new@test.dev"

    def test_register_password_mismatch(self):
        res = self.client.post(self.register_url, {
            "email": "new@test.dev",
            "password": "StrongPass123!",
            "password_confirm": "DifferentPass123!",
        }, format="json")

        assert res.status_code == 400
        assert "password" in res.data

    def test_register_duplicate_email(self):
        UserFactory(email="dup@test.dev")

        res = self.client.post(self.register_url, {
            "email": "dup@test.dev",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }, format="json")

        assert res.status_code == 400

    def test_register_weak_password(self):
        res = self.client.post(self.register_url, {
            "email": "weak@test.dev",
            "password": "123",
            "password_confirm": "123",
        }, format="json")

        assert res.status_code == 400

    def test_login_success(self):
        user = UserFactory(email="login@test.dev")
        user.set_password("TestPass123!")
        user.save()

        res = self.client.post(self.login_url, {
            "email": "login@test.dev",
            "password": "TestPass123!",
        }, format="json")

        assert res.status_code == 200
        assert "access" in res.data
        assert "refresh" in res.data

    def test_login_wrong_password(self):
        user = UserFactory(email="login@test.dev")
        user.set_password("CorrectPass123!")
        user.save()

        res = self.client.post(self.login_url, {
            "email": "login@test.dev",
            "password": "WrongPass123!",
        }, format="json")

        assert res.status_code == 401

    def test_me_requires_auth(self):
        res = self.client.get(self.me_url)
        assert res.status_code == 401

    def test_me_returns_current_user(self):
        user = UserFactory(email="me@test.dev")
        self.client.force_authenticate(user=user)

        res = self.client.get(self.me_url)

        assert res.status_code == 200
        assert res.data["email"] == "me@test.dev"