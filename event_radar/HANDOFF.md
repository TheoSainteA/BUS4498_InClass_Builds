# Club Event Radar — Handoff for Christian

## What works now

Website: [Club Event Radar](https://theosaintea.github.io/BUS4498_InClass_Builds/event_radar/)

Club officers can post announcements and optional JPG/PNG flyer photos. The Supabase Edge Function turns each post into an event card, checks the posting rules, catches duplicates, and sends posts needing review to the moderator queue. Published events appear on the public board; moderators can sign in, approve or reject waiting posts, and approved flyer posts appear with their image.

## Where things live

- Repository: `BUS4498_InClass_Builds`, in GitHub.
- Supabase project: `event-radar` — [Project URL](https://vrcupgsiigjivzukmuuu.supabase.co).
- Website files: `event_radar/index.html`, `app.js`, `style.css`, and `config.js`.
- Rules and test posts: `event_radar/context/` and `event_radar/test/`.
- Database changes: `event_radar/supabase/migrations/`.
- AI agent: `event_radar/supabase/functions/submit-event/index.ts`.
- Supabase database table: `public.events`; flyer storage bucket: `flyers`.

## Secrets

Secret values stay in Supabase → Edge Functions → Secrets; Christian does not need the values.

- `OPENAI_API_KEY` — the agent’s current AI key.
- `SUPABASE_SECRET_KEYS` — preferred server key JSON used by the agent.
- `SUPABASE_SERVICE_ROLE_KEY` — fallback server key name used by the agent.

The website’s Project URL and publishable key are public and are stored in `event_radar/config.js`. Never add a secret key, database password, or AI key to the repository.

## How to test

1. Paste sample post A from `test/sample-announcements.md`. It should be **Published** with the correct date, place, **Free**, and **Free food** tags. Submit it again; it should say **Already posted**.
2. Submit `test/sample-flyer.png` with “Clothing swap next week, all the details are on the flyer!” The result should be **Waiting for a moderator**, with the flyer’s event details and an R9 photo-review reason. Sign in as moderator, approve it, and confirm it appears publicly with the flyer.
3. Submit sample post F. It should be **Not posted** because a textbook sale is not an event. Sample post E should wait because the date, start time, and place are missing.

## What’s next

- Upload the repository changes with GitHub Desktop and confirm GitHub Pages is serving the website.
- Consider adding the optional nightly clean-up job to archive past events.
- Supabase Security Advisor currently suggests enabling leaked-password protection for Auth.

## How we take turns

Before starting, download the latest work with GitHub Desktop (pull) and tell each other you are working. When stopping, upload your changes (push) and tell each other what changed. Do not work on the same files at the same time.
