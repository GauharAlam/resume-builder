# ResumeAI — AI Resume Builder (Frontend)

A web app for building, tailoring and exporting resumes with AI help. This repository is the React frontend; the API lives in [Backend_Resume](https://github.com/GauharAlam/Backend_Resume).

## Features

- **Three-panel editor** — a section-by-section builder, a live resume page, and a design panel side by side. On small screens the panels become tabs.
- **Start from what you have** — upload an existing resume (PDF, DOCX or TXT) or paste its text and AI sorts it into sections; import a public LinkedIn profile; draft example content for a role; or start blank.
- **Five templates** — Clean Serif, Professional IT, ATS Modern, Standard Classic and Tech Minimalist, with live thumbnails of your own resume.
- **Reorder and hide sections** — put Education or Projects first, or leave a section off the page without deleting it.
- **AI writing tools** — rewrite a summary or bullet list, draft bullets for a role, change tone, improve clarity, or tailor text to a job description. Every suggestion is reviewed before it is applied.
- **Click-to-edit on the page** — in the Clean Serif template, select text on the resume to edit it in place or send it to AI.
- **Resume strength** — a live completeness score with the next most useful fix, plus AI analysis: ATS score, job-description match and cover-letter generation.
- **Design controls** — font, text size, accent colour, spacing and line height.
- **Text-based PDF export** — the PDF contains real, selectable text that applicant tracking systems can read. Word (DOCX) export follows the resume's order, colour and font.
- **Public share links**, **autosave** and **undo/redo**.

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 18, TypeScript, Vite |
| Styling | Tailwind CSS 3 (built with PostCSS) |
| Routing | React Router 6 |
| Auth | Clerk |
| Icons | lucide-react |
| Export | Browser print engine (text PDF), docx (DOCX) |
| Import | pdfjs-dist (PDF), mammoth (DOCX), loaded on demand |
| Tests | Vitest |

## Getting started

**Prerequisites:** Node.js 18 or newer, a [Clerk](https://clerk.com) application, and the backend running locally or deployed.

```bash
git clone https://github.com/GauharAlam/resume-builder.git
cd resume-builder
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

The dev server runs at `http://localhost:3000`.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes in production | Base URL of the backend API, e.g. `http://localhost:5001/api`. In development it defaults to port 5001 on the current host. |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Publishable key from your Clerk application. |
| `VITE_ANALYTICS_ENDPOINT` | Optional | Overrides the analytics endpoint. Defaults to `<VITE_API_BASE_URL>/analytics/events`. |

AI requests and LinkedIn import go through the backend, so no provider keys belong here. Anything prefixed `VITE_` is shipped to the browser and is public. Never commit `.env`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check the project |
| `npm test` | Run the unit tests |

## Routes

| Path | Access | Page |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login`, `/register` | Public | Clerk sign-in and sign-up |
| `/view/:shareId` | Public | Shared, read-only resume |
| `/history` | Signed in | Dashboard of saved resumes |
| `/try` | Signed in | Creates a new resume and opens it |
| `/edit-resume/:id` | Signed in | Editor for one resume |

Signed-out visitors who open a protected page are sent to sign in and returned to that page afterwards.

## How PDF export works

"Download → PDF" opens the browser's print dialog with only the resume on the page; choosing **Save as PDF** produces a text-based file. Page margins and page breaks are handled by the print rules in `src/styles/app.css`. A "PDF as image" option remains as a fallback for browsers without a print dialog.

## Project structure

```
src/
├── App.tsx                  Routes (lazy-loaded) and providers
├── features/
│   ├── auth/                Login, register, route guard
│   └── resume/              Landing page, editor page, public resume page
├── components/
│   ├── editor/              Dashboard and dialogs (share, import, AI review)
│   │   └── v3/              Editor UI: builder, canvas, inspector, analysis, top bars
│   ├── templates/           Resume templates, shared helpers and the registry
│   └── common/              Toasts
├── hooks/                   useResume (resume state, autosave, undo/redo)
├── context/                 Auth context
├── services/                API client, AI and analytics calls
├── utils/                   Export, import, strength score, helpers
├── __tests__/               Unit tests
└── types/                   Shared TypeScript types
```

## Deployment

The app is a static single-page build. `netlify.toml` and `vercel.json` are included and both rewrite every path to `index.html` so client-side routes work.

1. Set the environment variables above in your hosting provider.
2. Build with `npm run build` and publish the `dist/` folder.
3. Add the deployed frontend URL to `CORS_ORIGINS` on the backend.

## Related

- Backend API: [GauharAlam/Backend_Resume](https://github.com/GauharAlam/Backend_Resume)
