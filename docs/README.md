# Wslny Admin Dashboard — Documentation

The **Wslny Admin Dashboard** is the operations console for the Wslny
public-transit platform (Cairo, Egypt). It is a React SPA that lets platform
operators monitor usage, manage accounts, analyse routing performance, and
triage feedback — all driven by the Django REST API.

This folder contains the **operator-facing documentation**. For developer-
facing material (architecture, API contract, roadmap), see the links below.

---

## 📘 For operators (end users)

👉 **[Admin User Guide](admin-guide.md)** — every feature, step-by-step,
with screenshots. Start here if you log in to the dashboard to do your job.

The guide covers:

- Signing in (and out)
- The Dashboard — your at-a-glance view of platform health
- Managing users — search, filter, edit, deactivate, change role
- Route Analytics — overview, top routes, filter usage, unresolved queries
- User Analytics — growth and engagement
- Feedback — review summaries and the full list of comments
- Query Builder — composable analytics with presets
- System Health — live status of the database, AI service, and routing engine
- Profile — editing your own admin info and changing your password
- Common UI patterns — loading, errors, empty states, toasts, pagination
- Troubleshooting — what to do when something looks wrong

---

## 📚 Reference

If you are looking for something else, these docs cover different aspects:

| Document | Audience | Contents |
|---|---|---|
| [README.md](../README.md) | Developers / operators | Quick-start, scripts, tech stack |
| [.speckit/spec.md](../.speckit/spec.md) | Product / engineering | v1 functional & non-functional requirements |
| [.speckit/constitution.md](../.speckit/constitution.md) | Engineering | Governing principles (stack is non-negotiable) |
| [.speckit/plan.md](../.speckit/plan.md) | Engineering | Architecture, API mapping, file layout, risks |
| [.speckit/roadmap.md](../.speckit/roadmap.md) | Product / engineering | v1 status + v1.1 / v1.2 / v2.0 backlog |
| [endpoints.json](../endpoints.json) | Engineering | Full OpenAPI 3 contract of the backend |

---

## 🖼 Screenshots

The user guide references 22 screenshots, stored in the [images/](images/)
folder using the `fig-N.M.png` naming convention. To regenerate any of them,
open the corresponding section of [admin-guide.md](admin-guide.md) — every
figure has an **"Image description"** block beneath it that lists exactly
what should be in the frame (viewport size, visible elements, crop boundary).

If a screenshot is missing, the Markdown still renders cleanly — the image
link just appears as a broken-link placeholder.

---

_Last updated: 2026-06-25._
