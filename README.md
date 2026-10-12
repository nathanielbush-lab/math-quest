# Math Quest 🧭

An adaptive practice app that teaches middle school math (North Carolina Grades 6–8 standards), built from the *My Middle School Math Roadmap* (CMS Horizons readiness). It teaches each idea, practices it, steps back to simpler building blocks when she's stuck, and brings skills back days later to make sure they stick.

Everything runs in the browser. There's no account and no server, and progress is saved on the computer she's using.

## Using it

- **Hosted:** once GitHub Pages is on (see below), open the Pages URL on the MacBook or the Windows desktop.
- **Offline file:** `math-quest-offline.html` is the whole app in one file. Double-click it to open it in Chrome, Edge or Safari.

### First run
1. Enter her name.
2. **Find my starting point**: short adaptive checks, one topic at a time (about 4–8 questions each). They start mid-topic and move up or down, so she skips what she already knows. You can do a few topics a day, and skip any topic that's brand new.
3. Then **Start today's quest** each session.

### A daily quest follows the roadmap's session shape
| Part | What happens |
|---|---|
| **Warm-up** (~5 min) | Spaced-review questions on skills due for a check, plus old mistakes with fresh numbers |
| **Learn** (15–20 min) | New idea → lesson with a visual model → worked example (step by step) → guided problem → practice. Moves to a second skill from the *shapes & data* strand ("explore alongside") |
| **Challenge** (~10 min) | An unfamiliar multi-step problem: estimate first, solve, check reasonableness. Sometimes followed by "explain it in your own words" |

### How the adaptivity works
- **Skill map:** 84 small skills grouped into the roadmap's 15 topics (plus a Grade 5 fractions warm-up). Each skill lists the skills it depends on, and a skill unlocks only when its prerequisites are solid.
- **Levels** match the roadmap: *Exploring → Practicing → Independent → Can explain & apply*.
  - **Practicing:** first correct answer without help.
  - **Ready to build on** (unlocks the next skills): a high mastery estimate *and* about 4 of the last 5 answers right without hints.
  - **Independent:** right again on a **later day** in a warm-up review ("a single successful example is not enough").
  - **Can explain & apply:** Independent, plus a "why does it work?" question, plus a written explanation marked *got it*, plus another retention check a few days later.
- **Stepping back:** if she misses 3 of the last 4 on a skill, the app gives a quick check on its prerequisites. If one is shaky, it switches to that skill (lesson recap, easier problems) and returns once it's solid. If the prerequisites are fine, it re-teaches the current skill with an example and easier numbers.
- **Never on one mistake:** a single wrong answer never drops a level. A skill only goes back to *Practicing* after two review misses in a row.
- **Difficulty** within a skill rises after 3 right in a row and drops after 2 misses.
- **Spaced review:** checks at 1, 3, 7, 14, 30 and 60 days.
- **Help:** two tries per question, hints that go from a nudge to nearly the whole method, and feedback that names common mistakes (for example "you added the denominators").
- **Unlimited practice:** problems are generated with fresh numbers every time, so she can't memorize answers.

### Stage challenges
The three stage challenges from the roadmap unlock as she reaches the relevant skills: **plan a small party** (Grade 6), **design a board game** (Grade 7, with a dice simulator) and **compare bike-rental plans** (Grade 8, with graphing).

## Parent corner (👪 button, optional PIN)
- **Overview:** time and sessions this week, skills ready, pace toward your target date, this month's roadmap focus, and skills that are currently tricky.
- **Tracker:** the roadmap's progress tracker filled in with dates for each level and the next recheck. Printable.
- **Explanations:** her written explanations, with Claude's feedback if grading is on. Mark them *Got it* or *Needs revision* yourself, or **Copy pending for a Claude chat** to paste them into claude.ai.
- **Mistakes:** what she missed, her answer and the right answer, grouped by skill.
- **Settings:** session length, an on-screen calculator on/off switch (set it to match the screener once you know the rules), read-aloud, target date, the Claude API key, and backup.

### Claude grading (optional)
Paste an Anthropic API key (from platform.claude.com) in **Settings**. Written explanations are then graded by **Claude Haiku 5.5**, at well under a cent each. Use **Test it** to confirm the key works.
- The key is stored only in this browser and sent only to Anthropic.
- Create a separate key with a low monthly spend limit, because anyone using the browser could find it.
- Without a key, explanations wait for you in the Parent corner.

### Moving between computers / backup
Progress lives in each browser. To switch computers, go to **Parent corner → Settings → Download progress file** on the computer she used last, move the file (email, USB stick, or a cloud folder), then use **Load progress file** on the other computer. The app warns you if the file is older than what's already there. A download is also a good weekly backup. The API key isn't included in the file.

## Hosting on GitHub Pages
The workflow in `.github/workflows/deploy.yml` tests, builds and deploys on every push to `main`. To turn it on: repository **Settings → Pages → Source: GitHub Actions**. On a free GitHub plan, Pages needs a public repository. The repo contains no personal information; her progress never leaves her computer. If you'd rather keep the repo private, use the offline file.

## Development
```bash
npm install
npm run dev          # local dev server
npm test             # 266 tests: every generator checked on 750 problems, plus engine rules
npm run build        # static site in dist/
npm run build:single # one self-contained HTML file in dist-single/
```

Code map:
- `src/content/skills/*.ts`: skills by grade and topic. Each skill has a lesson, a problem generator with hints, steps and common-mistake feedback, and "why" questions. Standards codes are tagged, so the map can be updated when the revised NC standards take effect (2028–29).
- `src/content/challenges.ts`: end-of-session challenges and the three stage missions.
- `src/engine/`: mastery model, session planner (review / learn / challenge, step-back), placement check, answer checking, saving, export and import.
- `src/grading/`: Claude grading of written explanations.
- `src/screens/`, `src/components/`: the user interface.

Examples and problems were written for this app. They are not official CMS screening items and don't predict the screener's format or weighting.
