# GraceChurch Backend

## Project Overview
GraceChurch Backend powers the GraceChurch web application, managing sermons, live streams, and M-Pesa payments.  
It provides:

- Fetching and storing sermons from YouTube and Facebook.
- REST API endpoints for sermons and live stream status.
- M-Pesa payment integration.
- Weekly cron job to sync sermons automatically.
- Optimized for single-instance deployment (shared hosting like Namecheap).

---

## 🏗️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Axios (for external API calls)
- Node-Cron (scheduled jobs)
- dotenv (environment variable management)

---

## ✅ Completed Tasks / Features

### Sermon Management
- Fetch YouTube sermons (latest 10 per channel).
- Fetch Facebook sermons (all videos from page).
- Prevent duplicates using `videoId` uniqueness.
- Manual refresh endpoint available: `/api/sermons/refresh`.

### Pagination
- `GET /api/sermons?page=1&limit=9` supports paginated retrieval.
- Default limit: 9 sermons per page.

### Live Stream Status
- `GET /api/live-status` returns current YouTube and Facebook live stream info.
- Automatically updates every 2 minutes.

### Cron Jobs
- Weekly sync (every Sunday at 2 PM).
- Triggered automatically on server start.
- Prevents overlapping runs with state flag.
- Retry logic with logging for failed syncs.

### M-Pesa Integration
- `POST /api/mpesa/pay` initiates STK Push payments.
- `POST /api/mpesa/callback` receives payment notifications.

### Shared Hosting Optimizations
- Single-instance cron runs safely on server start.
- Retry mechanism for transient API failures.
- Efficient MongoDB queries with proper indexing.
- Logs for detailed sync progress.

---

## 🛠️ Installation

```bash
git clone <repo-url>
cd backend
npm install

Create a .env file with:

PORT=3001
MONGO_URI=<your_mongodb_uri>
YOUTUBE_API_KEY=<your_youtube_api_key>
YOUTUBE_CHANNEL_ID=<your_channel_id>
FACEBOOK_PAGE_ID=<your_facebook_page_id>
FACEBOOK_ACCESS_TOKEN=<your_facebook_access_token>
MPESA_CONSUMER_KEY=<your_consumer_key>
MPESA_CONSUMER_SECRET=<your_consumer_secret>
MPESA_SHORTCODE=<your_shortcode>
MPESA_PASSKEY=<your_passkey>

🚀 Running the Backend
npm start


Server will start on http://localhost:3001.

Initial sermon sync runs automatically.

Weekly cron job runs in background.

API Endpoints:

Method	Endpoint	Description
GET	/api/sermons	Fetch paginated sermons
POST	/api/sermons/refresh	Trigger manual sync
GET	/api/live-status	Check YouTube/Facebook live streams
POST	/api/mpesa/pay	Initiate M-Pesa payment
POST	/api/mpesa/callback	Receive payment callbacks
📦 Project Structure
backend/
├── controllers/
│   └── sermonController.js
├── models/
│   └── Sermon.js
├── routes/
│   └── sermonRoutes.js
├── utils/
│   ├── youtube.js
│   ├── facebook.js
│   └── cron.js
├── stk.js
├── server.js
└── package.json

📝 Notes

Ensure FACEBOOK_ACCESS_TOKEN is valid and long-lived.

Cron jobs run on deploy — no external scheduler required.

MongoDB indexes improve performance for sorting/filtering.

Logs provide detailed progress for YouTube and Facebook syncs.