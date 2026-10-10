# AcaVise — Academic Visibility & Progress Simulator (working website)

All 13 modules from `acavise_feature_documentation` implemented as a working static site.
No build step, no backend — open it and use it. Data persists in `localStorage`,
scoped per user exactly like the spec (`acavise_user_subjects_{id}`, `acavise_study_plan_{id}`,
`acavise_demo_settings_{id}`).

## Run

```bash
cd acavise-website
python3 -m http.server 8080
# open http://localhost:8080
```

Or just double-click `index.html` (hash routing works on `file://` too).

## What's inside

| Spec module | Route | Implemented |
|---|---|---|
| Landing / showcase | `#/` | hero, 4 question cards, 6 feature cards, math engine, CTA |
| Signup / Login | `#/signup`, `#/login` | validation, instant demo mode |
| Onboarding wizard | `#/onboarding` | name, branch, sem, CGPA, target |
| Sidebar / topbar / Cmd+K / notifications / mobile nav / themes | app shell | semester switcher, search palette, bell with badge, profile menu, Light/Dark/System |
| Dashboard | `#/dashboard` | CGPA+gap, SGPA, attendance tag, next deadline, subject list w/ trends, Ask-AcaVise chips, top-3 priorities, timeline |
| Academics | `#/academics` | sem 1–8 tabs, credits/SGPA/attendance, add-subject modal, delete, assessment inspector, deadline milestones |
| Targets simulator | `#/targets` | live target slider, required-SGPA formula, feasibility tiers, endterm % projection, per-course grade matrix |
| Priority engine | `#/priority` | score 1–100 (`Deficit + Credits×2`), urgency, diagnosis + action, `.txt` brief export |
| Weekly planner | `#/planner` | Mon–Sun board, hours progress, streak, add-block modal, check-off, delete |
| AI assistant | `#/ai-assistant` | grounded in live semester data, prompt pills, `?q=` deep-links, markdown answers |
| Settings | `#/settings` | profile, grading scale, cutoff, total credits, int/endterm ratio, notif toggles, theme, data reset |

## Math (exact spec §12)

- `SGPA = Σ(Score/10 × Credits)/ΣCredits`
- `Required SGPA = (Target×Total − Current×Completed)/Remaining`, `Completed=(Sem−1)×20`
- `Priority = min(100, max(10, Deficit + Credits×2))`, `Deficit=max(0,100−Score)`
- `Attendance = Σ(Att×Credits)/ΣCredits`

## Demo

Click **Instant Demo Mode** — seeded Sem-5 student (5 subjects, 4 deadlines, 7 planner blocks).
