"""
Daily Picks algorithm.

Picks 5 profiles per user per day based on interest overlap and location.
Deterministic: same user + same date = same picks.
"""

import random
from datetime import date, timedelta

from django.db.models import Q

from apps.profiles.models import Profile
from apps.safety.models import Block
from .models import Like, Match, Pass


def get_eligible_profiles(me: Profile):
    """Return all profiles eligible for daily picks, excluding interacted ones."""
    liked_ids = Like.objects.filter(liker=me).values_list("likee_id", flat=True)
    passed_ids = Pass.objects.filter(passer=me).values_list("passed_id", flat=True)
    blocked_by_me = Block.objects.filter(blocker=me).values_list("blocked_id", flat=True)
    blocked_me = Block.objects.filter(blocked=me).values_list("blocker_id", flat=True)

    # Matched profiles (both directions)
    matched_ids = Match.objects.filter(
        Q(profile_a=me) | Q(profile_b=me), is_active=True
    ).values_list("profile_a_id", "profile_b_id")
    matched_flat = set()
    for a, b in matched_ids:
        matched_flat.add(a)
        matched_flat.add(b)

    excluded = (
        set(liked_ids)
        | set(passed_ids)
        | set(blocked_by_me)
        | set(blocked_me)
        | matched_flat
        | {me.id}
    )

    return (
        Profile.objects.filter(
            is_visible=True,
            gender=me.interested_in,
            interested_in=me.gender,
        )
        .exclude(id__in=excluded)
        .select_related("user")
        .prefetch_related("interests__interest", "photos")
    )


def score_profile(me: Profile, other: Profile, my_interest_ids: set) -> float:
    """Compute a relevance score for a candidate profile."""
    score = 0.0

    # Shared interests (weighted heaviest)
    other_interest_ids = set(other.interests.values_list("interest_id", flat=True))
    shared = my_interest_ids & other_interest_ids
    score += 3.0 * len(shared)

    # Location
    if me.city and other.city and me.city.lower() == other.city.lower():
        score += 2.0
    if me.country and other.country and me.country.lower() == other.country.lower():
        score += 1.0

    # Activity
    week_ago = date.today() - timedelta(days=7)
    if other.last_active and other.last_active.date() >= week_ago:
        score += 1.0

    # Featured boost
    if other.is_featured:
        score += 5.0          # strong boost, but still beatable by high interest match

    return score


def get_daily_picks(me: Profile, count: int = 5) -> list[Profile]:
    """Return today's top picks for this user. Deterministic per (user, date)."""
    candidates = list(get_eligible_profiles(me))

    if not candidates:
        return []

    # Compute my interest IDs once
    my_interest_ids = set(me.interests.values_list("interest_id", flat=True))

    # Seed RNG with (user.id, today) → same picks all day
    seed = f"{me.id}-{date.today().isoformat()}"
    rng = random.Random(seed)

    # Score each candidate (base + deterministic random jitter)
    scored = []
    for profile in candidates:
        base_score = score_profile(me, profile, my_interest_ids)
        jitter = rng.uniform(0, 2)  # breaks ties + adds variety
        scored.append((base_score + jitter, profile))

    # Sort by score desc, take top N
    scored.sort(key=lambda x: x[0], reverse=True)
    return [profile for _, profile in scored[:count]]


def seconds_until_reset() -> int:
    """Return seconds until next local midnight."""
    from django.utils import timezone
    now = timezone.localtime()
    tomorrow = (now + timedelta(days=1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return int((tomorrow - now).total_seconds())