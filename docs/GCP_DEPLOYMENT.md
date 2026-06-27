# NagarSeva GCP Deployment

This is the recommended production deployment path for the hackathon submission:

- **Backend**: Google Cloud Run
- **Frontend**: Firebase Hosting
- **Auth**: Firebase Authentication
- **AI**: Gemini API via Google AI Studio
- **Database**: MongoDB Atlas

This keeps the current app intact and satisfies the requirement that the deployed application is on Google Cloud.

## 1. Prerequisites

Install and log into:

- `gcloud`
- `firebase`

Then authenticate:

```bash
gcloud auth login
gcloud auth application-default login
firebase login
```

## 2. Set your Google Cloud project

If you are using the existing Firebase project:

```bash
gcloud config set project vibe2ship-11096
```

Enable required services:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
```

## 3. Prepare backend environment

Use the values from:

- [backend/.env.example](/home/aryan-s/Documents/Web-dev-main/V2s/NagarSeva/backend/.env.example)

Required production secrets:

- `MONGODB_URI`
- `FRONTEND_ORIGIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `SARVAM_API_KEY`
- `SARVAM_STT_MODEL`
- `SARVAM_STT_MODE`
- `SARVAM_STT_LANGUAGE`
- `CLOUD_NAME`
- `CLOUD_API_KEY`
- `CLOUD_API_SECRET`
- `OPENCAGE_API_KEY`

## 4. Deploy backend to Cloud Run

From the repo root:

```bash
gcloud run deploy nagarseva-backend \
  --source backend \
  --region asia-south1 \
  --allow-unauthenticated
```

After the first deploy, set production env vars:

```bash
gcloud run services update nagarseva-backend \
  --region asia-south1 \
  --update-env-vars FRONTEND_ORIGIN=https://your-frontend.web.app,MONGODB_URI=your_mongodb_uri,FIREBASE_PROJECT_ID=your_project_id,FIREBASE_CLIENT_EMAIL=your_client_email,FIREBASE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',GEMINI_API_KEY=your_gemini_key,GEMINI_MODEL=gemini-2.5-flash-lite,SARVAM_API_KEY=your_sarvam_key,SARVAM_STT_MODEL=saaras:v3,SARVAM_STT_MODE=transcribe,SARVAM_STT_LANGUAGE=unknown,CLOUD_NAME=your_cloud_name,CLOUD_API_KEY=your_cloud_api_key,CLOUD_API_SECRET=your_cloud_api_secret,OPENCAGE_API_KEY=your_opencage_key
```

Notes:

- Use **single quotes** around `FIREBASE_PRIVATE_KEY` in shell commands.
- For a cleaner production setup, move secrets into **Secret Manager** after the first working deploy.

## 5. Prepare frontend production env

Copy:

- [frontend/.env.production.example](/home/aryan-s/Documents/Web-dev-main/V2s/NagarSeva/frontend/.env.production.example)

to:

```bash
frontend/.env.production
```

Set:

- `VITE_BACKEND_URL` to your Cloud Run backend URL
- Firebase web config values from the Firebase console

## 6. Build frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

## 7. Deploy frontend to Firebase Hosting

Initialize Hosting if needed:

```bash
firebase use vibe2ship-11096
```

Deploy:

```bash
firebase deploy --only hosting
```

Expected frontend URLs:

- `https://vibe2ship-11096.web.app`
- `https://vibe2ship-11096.firebaseapp.com`

## 8. Update Firebase Authentication

In Firebase Console:

- Authentication
- Settings
- Authorized domains

Add:

- `vibe2ship-11096.web.app`
- `vibe2ship-11096.firebaseapp.com`
- your custom domain if used

## 9. Final production checks

Verify:

1. Citizen signup/login
2. Municipal signup/login
3. Report with image
4. Report with video
5. Sarvam STT transcription
6. Issue appears on community map
7. Community authenticity voting works
8. Municipal scoped queue works
9. Leaderboard shows real names and avatars
10. Dashboard avatar update persists

## 10. Submission links

Use these in the hackathon submission:

- **Deployed app**: Firebase Hosting URL
- **Backend API**: Cloud Run URL
- **GitHub repo**: your NagarSeva repository
- **Google Doc**: separate artifact
