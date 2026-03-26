# Digital Gaon - Fullstack Authentication System

A modern, secure login system built with React, Node.js, Express, and MongoDB.

## Features
- **Google OAuth**: Sign in with your Google account via Firebase.
- **OTP Verification**: Secure 6-digit OTP sent to Gmail via Nodemailer.
- **JWT Authentication**: Industry-standard session management.
- **Mock Mode**: Built-in development mode to test the flow without API keys.
- **Premium UI**: Dark-themed, responsive design with glassmorphism.

## Tech Stack
- **Frontend**: React (Vite), Firebase, Axios, React Router.
- **Backend**: Node.js, Express, Mongoose (MongoDB), Nodemailer, JWT.

## Quick Start (Mock Mode)
1. Clone the repository.
2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Run the servers:
   - Backend: `cd backend && node server.js`
   - Frontend: `cd frontend && npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) and use code `123456` to verify.

## Setting up Real Auth
Please refer to the detailed instructions in the [walkthrough.md](walkthrough.md) (locally generated in the brain folder) or the Firebase/Nodemailer sections in `backend/server.js`.
