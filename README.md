# Workout Journal — Deployment Guide

## Deploy to Vercel (recommended, free)

1. Go to [vercel.com](https://vercel.com) → sign up free with GitHub/Google
2. Click **Add New → Project**
3. Click **"Import from your computer"** or drag the project folder
4. Leave all settings as default — Vercel auto-detects Vite
5. Click **Deploy** — takes ~60 seconds
6. Copy your URL (e.g. `your-app.vercel.app`)

## Deploy to Netlify (alternative, also free)

1. Go to [netlify.com](https://netlify.com) → sign up free
2. Drag the entire project folder onto the Netlify dashboard
3. Done — you get a URL instantly

## Add to iPhone Home Screen (makes it act like a native app)

1. Open your Vercel/Netlify URL in **Safari** (must be Safari)
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

The app now lives on your home screen, runs fullscreen with no browser UI,
timers fire notifications even when you switch apps, and works offline.

## Updating the app later

1. Ask Claude to make changes → download the new `workout-journal.jsx`
2. Replace `src/App.jsx` with the new file
3. Redeploy to Vercel: go to your project → **Deployments** → drag new folder
   OR use Vercel CLI: `npx vercel --prod`

**Your data is safe** — it lives in localStorage on your phone, completely
separate from the app code. Redeploying never touches your data.

## Backups (important)

Your data lives only in Safari's storage on your phone. If it's cleared, it's gone.
The app reminds you to back up when your last backup is 7 or more days old. Tap
**Back up** and choose Google Drive or Files in the share sheet.

To restore on a new phone, open the app and import the latest `workout_backup_*.json`.

## Server settings (Vercel > Settings > Environment Variables)

AI logging, Macro Chef, and Progress Photos run through `/api/*` functions so no
key is ever sent to the browser.

| Variable | What it is |
| --- | --- |
| `APP_PASSCODE` | Any passcode you choose. The app asks for it once per phone. |
| `ANTHROPIC_API_KEY` | Your Anthropic key (server only, never `VITE_`). |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | The full JSON key of a Google Cloud service account with the Drive API enabled. |
| `DRIVE_PHOTOS_FOLDER_ID` | The ID of your progress photos folder. |

For photos: share the Drive folder with the service account's email as Viewer,
then turn off "Anyone with the link" so the photos are private.

Delete the old `VITE_ANTHROPIC_API_KEY` and `VITE_GOOGLE_DRIVE_API_KEY` variables,
and rotate the Anthropic key, since the old one was visible in the app bundle.

## Local development

```bash
npm install
npm run dev
# Open http://localhost:3000
```
