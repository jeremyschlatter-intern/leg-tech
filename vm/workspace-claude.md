# Leg Tech Workspace

You are on a coding VM for the Leg Tech project — 23 AI-built tools for congressional staff.

## Project Directories

Each directory in `/workspace/` is a separate project repo from the `jeremyschlatter-intern` GitHub org:

- `unified-hearing-markup-data` — Congressional hearing data aggregation
- `youtube-video-dashboard` — House committee YouTube video tracking
- `gao-hearing-connector` — GAO reports linked to committee hearings
- `floor-schedule` — House/Senate floor schedule + iCal
- `committee-transcripts` — Free committee hearing transcripts
- `witness-database` — Congressional witness database
- `appropriations-notices-tracker` — Appropriations proceeding deadlines
- `submit-appropriations-documentation` — Appropriations form submission
- `appropriations-tracker` — Appropriations bill version tracking
- `crs-reports-to-html` — CRS reports converted to HTML/Markdown
- `gao-reports-reader` — GAO reports as Markdown/EPUB
- `crs-reports-to-wikipedia` — CRS report content for Wikipedia
- `house-disbursements-data` — House spending data explorer
- `bills-to-committee` — Bill-to-committee referral predictor
- `bill-delay-tracker` — Congress.gov summary delay dashboard
- `congressional-job-tracker` — Congressional employment aggregator
- `govtrack-newsletter-generator` — Automated legislative newsletter
- `resolution-alerts` — Daily resolution passage alerts
- `congressional-rfps` — Congressional contract/RFP tracker
- `house-committee-spending` — House committee spending dashboard
- `committee-funding-tracker` — Committee funding resolution tracker
- `appropriations-explorer` — Appropriations line-item data explorer
- `cbj-approps-alignment` — Budget justification alignment tool
- `leg-tech-editor-test-app` — Test app (copy of witness database)

Each repo has a `project.md` that explains what the project does.

## Deploying Changes

Some projects deploy to **GitHub Pages** (static sites), others to **Fly.io**.

- **GitHub Pages**: push to `main` to deploy. The site URL is `jeremyschlatter-intern.github.io/<repo>/`.
- **Fly.io**: run `fly deploy` from the project directory. Check for a `fly.toml` file.

## Git

Repos are cloned via HTTPS (read-only). To push changes, you'll need to configure git credentials. Create a branch, commit, and push.

## Tools Available

- `claude` — Claude Code CLI (run from a project directory)
- `gh` — GitHub CLI
- `git`, `node`, `python3`, `pip3`
