Monastery360 - MongoDB Setup and Data Import

Prerequisites
- Node.js 18+
- MongoDB running locally or a connection string (Atlas or self-hosted)

Environment Variables
Create a .env file in the project root with:

MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=monastery360
PORT=5173
VITE_API_BASE=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

Install Dependencies
```bash
npm install
```

Import Media Assets to GridFS
This scans src/assets and uploads images/audio into MongoDB GridFS under bucket "media".
```bash
npm run import:assets
```

Import Monasteries Dataset
This compiles src/data/monasteries.ts at runtime and upserts into the "monasteries" collection. It also rewrites image paths to use the media API.
```bash
npm run import:monasteries
```

Run the App
```bash
npm run dev
```

API Endpoints
- GET /api/monasteries – list all
- GET /api/monasteries/:id – fetch by id
- GET /api/media/:filename – stream media from GridFS

Notes
- Ensure MongoDB is running and the URI/DB name match your environment.
- For production, set VITE_API_BASE to your deployed server origin.


