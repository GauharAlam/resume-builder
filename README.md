<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/14d6_Yo0lHJJoRxmZQmWEKUHr4t6c5Z1k

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the frontend environment variables in `.env` or `.env.local`
   - `GEMINI_API_KEY=...`
   - `VITE_API_BASE_URL=http://localhost:5001/api`
   - `VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com`
3. Run the app:
   `npm run dev`

## Google Sign-In Setup

To enable Google sign-in, set the same Google OAuth web client ID in both apps:

- Frontend: `VITE_GOOGLE_CLIENT_ID`
- Backend: `GOOGLE_CLIENT_ID`
