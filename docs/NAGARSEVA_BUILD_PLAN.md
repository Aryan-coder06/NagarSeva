# NagarSeva Build Plan

## Base Decision

NagarSeva is currently bootstrapped from `tilakjain619/Smart-Community-Issue-Reporting-System` because it has the strongest functional fit for the hackathon core loop:

- image-backed civic issue reporting
- GPS coordinates and reverse geocoding
- interactive Leaflet map
- admin dashboard
- community feed and voting
- activity logs
- Cloudinary image handling
- existing AI categorization hook

`HarshS16/Civix` should be used as a feature and UX donor, not as the main codebase. Civix has useful civic education, gamification, sidebar/admin UI ideas, and broader public-service branding, but its current report flow is less complete and its backend issue model is much thinner.

## Product Positioning

NagarSeva should be pitched as an AI civic operations layer:

> NagarSeva converts scattered citizen complaints into verified, prioritized, and trackable local action using Gemini-powered civic triage.

## Highest-Scoring Features

1. Gemini Civic Triage Agent
   - Replace OpenRouter with Gemini API.
   - Analyze uploaded issue image plus citizen message.
   - Return structured JSON: category, issue type, title, severity, urgency, suggested department, public summary, authority summary, recommended action, confidence.

2. Priority Engine
   - Calculate a transparent priority score from AI severity, community votes, verification count, issue age, and status.
   - Show this score in community feed and admin dashboard.

3. Duplicate Detection
   - Before creating an issue, search nearby open/in-progress issues.
   - Start with category plus distance radius.
   - Later add Gemini text similarity if time permits.

4. Community Verification
   - Extend simple voting into civic verification states: confirm, still unresolved, fixed, duplicate, invalid.
   - Store counts and use them in the priority score.

5. Admin Action Center
   - Sort by priority.
   - Show Gemini authority summary and recommended action.
   - Support status updates, assignment, and resolution notes.

6. AI Impact Insights
   - Dashboard sends aggregate issue stats to Gemini.
   - Gemini returns short operational insights: hotspots, recurring categories, unresolved severe issues, suggested next actions.

7. Civic Engagement
   - Port lightweight XP/badges concepts from Civix.
   - Award points for valid reports, confirmations, fixed evidence, and civic learning.

## Port From Civix

- Civic education / quiz ideas, simplified into one engagement tab.
- XP and achievement logic from simulator/education pages.
- More polished admin/sidebar visual patterns where they improve clarity.
- User-facing copy around civic responsibility and transparency.

## Replace

- Replace `backend/utils/analyseImage.js` OpenRouter implementation with Gemini.
- Replace Jagruk branding with NagarSeva.
- Replace simple category/title AI output with full civic triage structured output.

## Keep

- MongoDB/Mongoose data model.
- Appwrite auth for now unless it blocks deployment.
- Cloudinary upload flow.
- Leaflet map.
- Logs and admin pages.
- Vite frontend.

## Build Sequence

1. Stabilize local run and environment variables.
2. Rename product surface from Jagruk to NagarSeva.
3. Add Gemini dependency and `GEMINI_API_KEY`.
4. Upgrade issue model with AI triage, verification, duplicate, priority, and department fields.
5. Implement Gemini civic triage service.
6. Update create issue flow to store AI output and priority.
7. Add duplicate detection.
8. Add community verification endpoint and UI.
9. Upgrade admin dashboard with priority/action-center view.
10. Add Gemini impact insights to dashboard.
11. Polish frontend for a single powerful demo flow.
12. Prepare README, Google Doc content, screenshots, and deployment notes.

## Known Setup Notes

- Backend install completed, but `npm audit` reports 8 vulnerabilities.
- Frontend install completed, but `npm audit` reports 16 vulnerabilities.
- These should be reviewed after core features are stable; avoid blind `npm audit fix --force` because it may break the app.
