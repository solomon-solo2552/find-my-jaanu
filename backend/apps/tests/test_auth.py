import pytest
from rest_framework.test import APIClient

from apps.tests.factories import UserFactory


@pytest.mark.django_db
class TestAuth:
    def setup_method(self):
        self.client = APIClient()
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.me_url = "/api/auth/me/"

    # ---------------- Registration ----------------

    def test_register_success(self):
        res = self.client.post(
            self.register_url,
            {
                "email": "new@test.dev",
                "password": "StrongPass123!",
                "password_confirm": "StrongPass123!",
            },
            format="json",
        )

        assert res.status_code == 201
        assert "access" in res.data
        assert "refresh" in res.data
        assert res.data["user"]["email"] == "new@test.dev"

    def test_register_password_mismatch(self):
        res = self.client.post(
            self.register_url,
            {
                "email": "new@test.dev",
                "password": "StrongPass123!",
                "password_confirm": "DifferentPass123!",
            },
            format="json",
        )

        assert res.status_code == 400
        assert "password" in res.data

    def test_register_duplicate_email(self):
        UserFactory(email="dup@test.dev")

        res = self.client.post(
            self.register_url,
            {
                "email": "dup@test.dev",
                "password": "StrongPass123!",
                "password_confirm": "StrongPass123!",
            },
            format="json",
        )

        assert res.status_code == 400

    def test_register_weak_password(self):
        res = self.client.post(
            self.register_url,
            {
                "email": "weak@test.dev",
                "password": "123",
                "password_confirm": "123",
            },
            format="json",
        )

        assert res.status_code == 400

    # ---------------- Login ----------------

    def test_login_success(self):
        user = UserFactory(email="login@test.dev")
        user.set_password("TestPass123!")
        user.save()

        res = self.client.post(
            self.login_url,
            {
                "email": "login@test.dev",
                "password": "TestPass123!",
            },
            format="json",
        )

        assert res.status_code == 200
        assert "access" in res.data
        assert "refresh" in res.data

    def test_login_wrong_password(self):
        user = UserFactory(email="login@test.dev")
        user.set_password("CorrectPass123!")
        user.save()

        res = self.client.post(
            self.login_url,
            {
                "email": "login@test.dev",
                "password": "WrongPass123!",
            },
            format="json",
        )

        assert res.status_code == 401

    # ---------------- Me ----------------

    def test_me_requires_auth(self):
        res = self.client.get(self.me_url)
        assert res.status_code == 401

    def test_me_returns_current_user(self):
        user = UserFactory(email="me@test.dev")
        self.client.force_authenticate(user=user)

        res = self.client.get(self.me_url)

        assert res.status_code == 200
        assert res.data["email"] == "me@test.dev"

    # ---------------- Change Email ----------------

    def test_change_email_success(self):
        user = UserFactory(email="old@test.dev")
        user.set_password("TestPass123!")
        user.save()
        self.client.force_authenticate(user=user)

        res = self.client.post(
            "/api/auth/change-email/",
            {
                "new_email": "new@test.dev",
                "password": "TestPass123!",
            },
            format="json",
        )

        assert res.status_code == 200
        user.refresh_from_db()
        assert user.email == "new@test.dev"

    def test_change_email_wrong_password(self):
        user = UserFactory(email="old@test.dev")
        user.set_password("TestPass123!")
        user.save()
        self.client.force_authenticate(user=user)

        res = self.client.post(
            "/api/auth/change-email/",
            {
                "new_email": "new@test.dev",
                "password": "WrongPassword!",
            },
            format="json",
        )

        assert res.status_code == 400
        user.refresh_from_db()
        assert user.email == "old@test.dev"  # unchanged

    def test_change_email_duplicate(self):
        UserFactory(email="taken@test.dev")
        user = UserFactory(email="old@test.dev")
        user.set_password("TestPass123!")
        user.save()
        self.client.force_authenticate(user=user)

        res = self.client.post(
            "/api/auth/change-email/",
            {
                "new_email": "taken@test.dev",
                "password": "TestPass123!",
            },
            format="json",
        )

        assert res.status_code == 400

    # ---------------- Change Password ----------------

    def test_change_password_success(self):
        user = UserFactory(email="user@test.dev")
        user.set_password("OldPass123!")
        user.save()
        self.client.force_authenticate(user=user)

        res = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "OldPass123!",
                "new_password": "NewPass456!",
                "new_password_confirm": "NewPass456!",
            },
            format="json",
        )

        assert res.status_code == 200
        user.refresh_from_db()
        assert user.check_password("NewPass456!")

    def test_change_password_wrong_current(self):
        user = UserFactory(email="user@test.dev")
        user.set_password("OldPass123!")
        user.save()
        self.client.force_authenticate(user=user)

        res = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "WrongPass!",
                "new_password": "NewPass456!",
                "new_password_confirm": "NewPass456!",
            },
            format="json",
        )

        assert res.status_code == 400
        user.refresh_from_db()
        assert user.check_password("OldPass123!")  # unchanged

    def test_change_password_mismatch(self):
        user = UserFactory(email="user@test.dev")
        user.set_password("OldPass123!")
        user.save()
        self.client.force_authenticate(user=user)

        res = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "OldPass123!",
                "new_password": "NewPass456!",
                "new_password_confirm": "Different789!",
            },
            format="json",
        )

        assert res.status_code == 400

    # ---------------- Delete Account ----------------

    def test_delete_account_success(self):
        user = UserFactory(email="delete@test.dev")
        user.set_password("TestPass123!")
        user.save()
        self.client.force_authenticate(user=user)

        res = self.client.delete(
            "/api/auth/delete-account/",
            {
                "password": "TestPass123!",
                "confirmation": "DELETE",
            },
            format="json",
        )

        assert res.status_code == 204
        from django.contrib.auth import get_user_model

        assert not get_user_model().objects.filter(email="delete@test.dev").exists()

    def test_delete_account_wrong_confirmation(self):
        user = UserFactory(email="delete@test.dev")
        user.set_password("TestPass123!")
        user.save()
        self.client.force_authenticate(user=user)

        res = self.client.delete(
            "/api/auth/delete-account/",
            {
                "password": "TestPass123!",
                "confirmation": "delete",  # lowercase — should fail
            },
            format="json",
        )

        assert res.status_code == 400
        from django.contrib.auth import get_user_model

        assert get_user_model().objects.filter(email="delete@test.dev").exists()

    def test_delete_account_wrong_password(self):
        user = UserFactory(email="delete@test.dev")
        user.set_password("TestPass123!")
        user.save()
        self.client.force_authenticate(user=user)

        res = self.client.delete(
            "/api/auth/delete-account/",
            {
                "password": "WrongPass!",
                "confirmation": "DELETE",
            },
            format="json",
        )

        assert res.status_code == 400
