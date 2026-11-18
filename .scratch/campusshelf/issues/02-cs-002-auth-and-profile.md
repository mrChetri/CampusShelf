# 02: CS-002 Authentication + Profile Bootstrap

**What to build:** User authentication using Supabase Auth with Google OAuth, backend JWT bearer token verification middleware, a `/me` endpoint returning the authenticated student's profile, and guest browsing mode without forcing immediate login.

**Blocked by:** 01: CS-001 Workspace Foundation + CI

**Status:** ready-for-agent

- [ ] Supabase Auth client configured on frontend and Supabase admin/auth client configured on backend
- [ ] Backend auth middleware validates Supabase JWT access token on private routes and attaches user identity
- [ ] `GET /me` endpoint returns current user profile derived from validated server session
- [ ] Web app supports signing in with Google OAuth, signing out, and displaying active user profile state
- [ ] Unauthenticated guest users can freely browse public routes without forced redirection
