# Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
OPENAI_API_KEY=sk-your-openai-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
PORT=5001
```

3. Start server:
```bash
npm start
```

Server runs on `http://localhost:5001`

## API Routes

- `/api/projects` - Project management
- `/api/sections` - Section management
- `/api/tasks` - Task management
- `/api/ai` - AI features (suggestions, summaries)

See main README.md for complete documentation.
