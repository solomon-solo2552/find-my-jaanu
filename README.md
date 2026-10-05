# Find My JAANU 💘

A full-stack social matching platform built with **Next.js**, **Django**, and **PostgreSQL**.

> ⚠️ Personal learning project — not intended for production use.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, TypeScript
- **Backend:** Django 5, Django REST Framework, Django Channels
- **Database:** PostgreSQL
- **Cache / WebSocket broker:** Redis
- **Auth:** JWT (djangorestframework-simplejwt)
- **Media:** Cloudinary
- **Deploy:** Vercel (FE), Render (BE)

## Features (planned)
- [ ] Email + JWT auth
- [ ] Profile onboarding with photos & interests
- [ ] Swipe-based matching
- [ ] Real-time chat
- [ ] Report & block

## Local Development
See `backend/README.md` and `frontend/README.md`.

## Progress Log
- **Day 1:** Project scaffolding — Django + Next.js + PostgreSQL setup, first migration successful. 
- **Day 2 (✅):** Database schema — all core models implemented, migrations applied, admin configured.
- **Day 3 (✅):** Authentication API — JWT signup, login, refresh, /me verified via curl.
- **Day 4 (✅):** Profiles API — CRUD, filters, photo upload, interests, seeding.
- **Day 5 (✅):** Frontend auth flow — axios interceptors, Zustand store, signup/login pages, protected routes.
- **Day 6 (✅):** Onboarding flow, profile view/edit pages, photo uploader, interest picker.
- **Day 7 (✅):** Swipe matching — Discover feed, Like/Pass, auto-match, match modal.
- **Day 8 (✅):** Matches list page, unmatch flow, new-match badge, chat placeholder.
- **Day 9 (✅):** Real-time chat — Django Channels, JWT WS auth, live messaging, read receipts.
- **Day 10 (✅):** Safety — Report & Block with match deactivation and discover exclusion.
- **Day 11 (✅):** UX polish — toasts, skeletons, empty states, 404, error boundary, blocked users page.
- **Day 12 (✅):** Fake user seeding for populated demo — 25 users, photos, matches, chat history.
- **Day 13 (✅):** Public profile view with photo carousel, relation states, and full actions.
- **Day 14 (✅):** Likes tab — Likes You / You Liked with quick like-back to instant match.